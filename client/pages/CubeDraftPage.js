/**
 * This file is part of CubeArtisan.
 *
 * CubeArtisan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CubeArtisan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with CubeArtisan.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Modified from the original version in CubeCobra. See LICENSE.CubeCobra for more information.
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { Box, Button, ButtonGroup, CircularProgress, Divider, Grid, Stack, Toolbar, Typography } from '@mui/material';

import { csrfFetch } from '@cubeartisan/client/utils/CSRF.js';
import CustomImageToggler from '@cubeartisan/client/components/CustomImageToggler.js';
import DeckStacks from '@cubeartisan/client/components/DeckStacks.js';
import DndProvider from '@cubeartisan/client/components/DndProvider.js';
import { DraftbotBreakdownTable } from '@cubeartisan/client/components/DraftbotBreakdown.js';
import DraggableCard from '@cubeartisan/client/components/DraggableCard.js';
import ErrorBoundary from '@cubeartisan/client/components/ErrorBoundary.js';
import DisplayContext, { DisplayContextProvider } from '@cubeartisan/client/components/contexts/DisplayContext.js';
import useToggle from '@cubeartisan/client/hooks/UseToggle.js';
import CubeLayout from '@cubeartisan/client/components/layouts/CubeLayout.js';
import MainLayout from '@cubeartisan/client/components/layouts/MainLayout.js';
import CubePropType from '@cubeartisan/client/proptypes/CubePropType.js';
import { DrafterStatePropType } from '@cubeartisan/client/proptypes/DraftbotPropTypes.js';
import { makeSubtitle } from '@cubeartisan/client/utils/Card.js';
import DraftLocation from '@cubeartisan/client/drafting/DraftLocation.js';
import RenderToRoot from '@cubeartisan/client/utils/RenderToRoot.js';
import TextBadge from '@cubeartisan/client/components/TextBadge.js';
import Tooltip from '@cubeartisan/client/components/Tooltip.js';
import SetCardsInRow from '@cubeartisan/client/components/SetCardsInRow.js';
import useTimer from '@cubeartisan/client/hooks/UseTimer.js';
import UserContext from '@cubeartisan/client/components/contexts/UserContext.js';
import {
  getDefaultPosition,
  getWorstScore,
  convertDrafterState,
  initializeMtgDraftbots,
  validActions,
} from '@cubeartisan/client/drafting/draftutil.js';

const canDrop = (_, target) => {
  return target.type === DraftLocation.PICKS;
};

const Pack = ({
  pack,
  packNumber,
  pickNumber,
  instructions,
  picking,
  onMoveCard,
  onClickCard,
  emptySeats,
  seconds,
  waitingMessage,
}) => {
  const { cardsInRow } = useContext(DisplayContext);
  return (
    <Stack divider={<Divider />}>
      <Box sx={{ backgroundColor: 'var(--bg-darker)' }}>
        <Typography variant="h4">
          {Number.isInteger(pickNumber) && pickNumber ? (
            <>
              Pack {packNumber}, Pick {pickNumber}
              {instructions ? `: ${instructions}` : ''}
            </>
          ) : (
            <>Loading Draft</>
          )}
        </Typography>
        {emptySeats > 0 && (
          <TextBadge
            name={`Waiting on ${emptySeats} player${emptySeats > 1 ? 's' : ''} to join. Players can join by going to`}
          >
            <Tooltip title="Click to copy to clipboard">
              <Button
                onClick={async (e) => {
                  await navigator.clipboard.writeText(window.location.href);
                  e.currentTarget.blur();
                }}
              >
                {window.location.href}
              </Button>
            </Tooltip>
          </TextBadge>
        )}
        {(seconds || null) && (
          <Typography variant="button">
            {seconds} second{seconds > 1 ? 's' : ''} remaining to choose.
          </Typography>
        )}
      </Box>
      <Box>
        {pack.length > 0 ? (
          <Grid container columns={cardsInRow} spacing={0}>
            {pack.map((card, index) => (
              <Grid
                item
                xs={1}
                key={/* eslint-disable-line react/no-array-index-key */ `${packNumber}:${pickNumber}:${index}`}
                cardsinrow={cardsInRow}
                className="justify-content-center align-items-center"
              >
                {picking === index && <CircularProgress className="position-absolute" />}
                <DraggableCard
                  location={DraftLocation.pack([index])}
                  data-index={index}
                  card={card}
                  canDrop={canDrop}
                  onMoveCard={picking === null ? onMoveCard : undefined}
                  onClick={picking === null ? onClickCard : undefined}
                  className={picking === index ? 'transparent' : undefined}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <CircularProgress /> <h6>{waitingMessage}</h6>
          </>
        )}
      </Box>
    </Stack>
  );
};

Pack.propTypes = {
  pack: PropTypes.arrayOf(PropTypes.object).isRequired,
  packNumber: PropTypes.number.isRequired,
  pickNumber: PropTypes.number.isRequired,
  instructions: PropTypes.string,
  picking: PropTypes.number,
  onMoveCard: PropTypes.func.isRequired,
  onClickCard: PropTypes.func.isRequired,
  emptySeats: PropTypes.number.isRequired,
  seconds: PropTypes.number,
  waitingMessage: PropTypes.string.isRequired,
};

Pack.defaultProps = {
  picking: null,
  instructions: null,
  seconds: 0,
};

const CubeDraftPlayerUI = ({ drafterState, drafted, takeCard, moveCard, picking, emptySeats, seconds }) => {
  const user = useContext(UserContext);
  const {
    cards,
    cardsInPack,
    step: { action, amount },
    packNum,
    pickNum,
    numPacks,
  } = drafterState;
  const [showBotBreakdown, toggleShowBotBreakdown] = useToggle(false);
  const pack = useMemo(() => cardsInPack.map((cardIndex) => cards[cardIndex]), [cardsInPack, cards]);
  // Picks is an array with 1st key C/NC, 2d key CMC, 3d key order
  const picks = useMemo(
    () => drafted.map((row) => row.map((col) => col.map((cardIndex) => cards[cardIndex]))),
    [drafted, cards],
  );
  const instructions = useMemo(() => {
    if (action === 'pick') {
      return `Pick ${amount + 1} More Card${amount + 1 > 1 ? 's' : ''}.`;
    }
    if (action === 'trash') {
      return `Trash ${amount + 1} More Card${amount + 1 > 1 ? 's' : ''}.`;
    }
    return null;
  }, [action, amount]);
  const waitingMessage = useMemo(() => {
    if (!user?._id) {
      return 'Login to connect to the draft.';
    }
    if (cards.length === 0) {
      return 'Connecting to draft.';
    }
    if (action === 'done') {
      return 'Waiting for draft to finish.';
    }
    if (validActions.includes(action)) {
      return 'Waiting for pack.';
    }
    return 'Something went wrong. Please reconnect.';
  }, [user, cards, action]);

  const handleMoveCard = useCallback(
    async (source, target) => {
      if (source.equals(target)) return;
      if (source.type === DraftLocation.PACK) {
        if (target.type === DraftLocation.PICKS) {
          takeCard(cardsInPack[source.data[0]], target.data);
        } else {
          console.error("Can't move cards inside pack.");
        }
      } else if (source.type === DraftLocation.PICKS) {
        if (target.type === DraftLocation.PICKS) {
          moveCard({ target: target.data, source: source.data });
        } else {
          console.error("Can't move cards from picks back to pack.");
        }
      }
    },
    [takeCard, cardsInPack, moveCard],
  );

  const handleClickCard = useCallback(
    async (event) => {
      event.preventDefault();
      const cardPackIndex = parseInt(event.currentTarget.getAttribute('data-index'), 10);
      const cardIndex = cardsInPack[cardPackIndex];
      await takeCard(cardIndex);
    },
    [cardsInPack, takeCard],
  );
  return (
    <>
      <Toolbar sx={{ backgroundColor: 'var(--bg-hover)' }}>
        <ButtonGroup variant="outlined">
          <Grid container>
          <Grid item xs="auto">
          <CustomImageToggler />
          </Grid>
          <Grid item xs="auto">
          <Button onClick={toggleShowBotBreakdown}>Toggle Bot Breakdown</Button>
          </Grid>
          <SetCardsInRow />
      </Grid>
        </ButtonGroup>
      </Toolbar>
      <DndProvider>
        {packNum < numPacks && (
          <>
            <ErrorBoundary>
              <Pack
                emptySeats={emptySeats}
                pack={pack}
                packNumber={packNum + 1}
                pickNumber={action === 'done' ? pickNum : pickNum + 1}
                instructions={instructions}
                picking={picking}
                onMoveCard={handleMoveCard}
                onClickCard={handleClickCard}
                seconds={seconds}
                waitingMessage={waitingMessage}
              />
            </ErrorBoundary>
            {showBotBreakdown && (
              <ErrorBoundary>
                <Box sx={{ backgroundColor: 'var(--bg-darker)' }}>
                  <Typography variant="h4">Draftbot Breakdown</Typography>
                </Box>
                <DraftbotBreakdownTable drafterState={drafterState} />
              </ErrorBoundary>
            )}
          </>
        )}
        <ErrorBoundary className="mt-3">
          <DeckStacks
            cards={picks}
            title="Picks"
            subtitle={makeSubtitle(picks.flat(3))}
            locationType={DraftLocation.PICKS}
            canDrop={canDrop}
            onMoveCard={handleMoveCard}
          />
        </ErrorBoundary>
      </DndProvider>
    </>
  );
};
CubeDraftPlayerUI.propTypes = {
  drafterState: DrafterStatePropType.isRequired,
  drafted: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired)
    .isRequired,
  takeCard: PropTypes.func.isRequired,
  moveCard: PropTypes.func.isRequired,
  picking: PropTypes.number,
  emptySeats: PropTypes.number.isRequired,
  seconds: PropTypes.number,
};
CubeDraftPlayerUI.defaultProps = {
  picking: null,
  seconds: 0,
};
export const CubeDraftPage = ({ cube, draftid, loginCallback }) => {
  const [picking, setPicking] = useState(null);
  const [emptySeats, setEmptySeats] = useState(0);
  const socket = useRef();
  const [drafterState, setDrafterState] = useState({
    step: { action: 'pass' },
    drafted: [],
    sideboard: [],
    picked: [],
    trashed: [],
    seatNum: -1,
    packNum: 0,
    pickNum: -1,
    numPacks: 1,
    packSize: 0,
    pickedNum: -1,
    trashedNum: -1,
    stepNumber: -1,
    pickNumber: -1,
    cardsInPack: [],
    cards: [],
    timeout: 0,
  });
  const makePick = useCallback(async () => {
    if (picking || !drafterState.timeout) return;
    if (drafterState.step.action === 'pick') {
      const { calculateBotPick } = await initializeMtgDraftbots();
      const choice = await calculateBotPick(convertDrafterState(drafterState));
      const chosen = drafterState.cardsInPack[choice.chosenOption];
      setPicking(chosen);
      socket.current.emit('pick card', chosen, getDefaultPosition(drafterState.cards[chosen], drafterState.drafted));
    } else if (drafterState.step.action === 'trash') {
      const { calculateBotPick } = await initializeMtgDraftbots();
      const choice = await calculateBotPick(convertDrafterState(drafterState));
      const chosen = drafterState.cardsInPack[getWorstScore(choice)];
      setPicking(chosen);
      socket.current.emit('trash card', chosen);
    }
  }, [drafterState, picking]);
  const [seconds, setSeconds] = useTimer(makePick);
  useEffect(() => {
    socket.current = io('/wsdraft', {
      autoConnect: true,
      query: { draftid },
    });
    socket.current.on('drafterState', (newDrafterState) => {
      setPicking(null);
      setDrafterState((oldDrafterState) => {
        console.log(newDrafterState);
        console.log(newDrafterState.cardsInPack.length, oldDrafterState.cardsInPack.length);
        if (oldDrafterState.cardsInPack.length !== newDrafterState.cardsInPack.length && newDrafterState.timeout) {
          setSeconds(newDrafterState.timeout * newDrafterState.cardsInPack.length);
        }
        return newDrafterState;
      });
    });
    socket.current.on('emptySeats', (newEmptySeats) => {
      setEmptySeats(newEmptySeats);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { action, drafted, sideboard, seatNum, doneDrafting, cardsInPack } = useMemo(
    () => ({
      action: drafterState.step.action,
      drafted: drafterState.drafted,
      sideboard: drafterState.sideboard,
      seatNum: drafterState.seatNum,
      cardsInPack: drafterState.cardsInPack,
      doneDrafting: drafterState.packNum >= drafterState.numPacks || drafterState.step.action === 'done',
    }),
    [drafterState],
  );

  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (doneDrafting && !submitted) {
      setSubmitted(true);
      socket.current.disconnect();
      (async () => {
        const response = await csrfFetch(`/draft/${draftid}/submit/${seatNum}`, { method: 'POST' });
        const json = await response.json();
        window.location.replace(json.url);
      })();
    }
  }, [doneDrafting, submitted, seatNum, draftid]);

  // This has to be async to allow the loading animation to be applied while it runs.
  const takeCard = useCallback(
    (cardIndex, target) => {
      if (socket.current && picking === null) {
        setPicking(cardsInPack.indexOf(cardIndex));
        if (action.match(/pick/)) {
          socket.current.emit('pick card', cardIndex, target);
        } else {
          socket.current.emit('trash card', cardIndex);
        }
      }
    },
    [action, picking, cardsInPack],
  );

  const moveCard = useCallback(({ source, target }) => {
    if (socket.current) {
      socket.current.emit('move card', source, target);
    }
  }, []);
  return (
    <MainLayout loginCallback={loginCallback}>
      <CubeLayout cube={cube} activeLink="playtest">
        <DisplayContextProvider cubeID={cube._id}>
          <CubeDraftPlayerUI
            emptySeats={emptySeats}
            picking={picking}
            drafterState={drafterState}
            sideboard={sideboard}
            drafted={drafted}
            takeCard={takeCard}
            moveCard={moveCard}
            seconds={seconds}
          />
        </DisplayContextProvider>
      </CubeLayout>
    </MainLayout>
  );
};
CubeDraftPage.propTypes = {
  cube: CubePropType.isRequired,
  draftid: PropTypes.string.isRequired,
  loginCallback: PropTypes.string,
};
CubeDraftPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(CubeDraftPage);
