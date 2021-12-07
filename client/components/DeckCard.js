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
import React, { lazy, useContext } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import DisplayContext from '@cubeartisan/client/components/contexts/DisplayContext.js';

import CardPropType from '@cubeartisan/client/proptypes/CardPropType.js';
import DraftSeatPropType from '@cubeartisan/client/proptypes/DraftSeatPropType.js';
import DeckPropType from '@cubeartisan/client/proptypes/DeckPropType.js';
import CommentsSection from '@cubeartisan/client/components/CommentsSection.js';
import FoilCardImage from '@cubeartisan/client/components/FoilCardImage.js';
import Markdown from '@cubeartisan/client/components/markdown/Markdown.js';
import Suspense from '@cubeartisan/client/components/wrappers/Suspense.js';
import CardHeader from '@cubeartisan/client/components/CardHeader.js';

const DecksPickBreakdown = lazy(async () => import('@cubeartisan/client/components/DecksPickBreakdown.js'));
const DraftbotBreakdown = lazy(async () => import('@cubeartisan/client/components/DraftbotBreakdown.js'));

const DeckStacksStatic = ({ piles, cards, cardsInRow }) => (
  <Grid container columns={cardsInRow}>
    {piles.map((row, index) =>
      row
        .map((column, index2) => (
          <Grid key={/* eslint-disable-line react/no-array-index-key */ `${index}-${index2}`} item xs={1}>
            {column.length > 0 && (
              <Typography align="center" variant="body1" fontWeight="bold">
                {column.length}
              </Typography>
            )}
            <div className="stack">
              {column.map((cardIndex, index3) => {
                const card = cards[cardIndex];
                return (
                  <div key={/* eslint-disable-line react/no-array-index-key */ index3} className="stacked">
                    <a href={card.cardID ? `/card/${card.cardID}` : null}>
                      <FoilCardImage card={card} tags={[]} autocard />
                    </a>
                  </div>
                );
              })}
            </div>
          </Grid>
        ))
        .flat(2),
    )}
  </Grid>
);

DeckStacksStatic.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({ cardID: PropTypes.string })).isRequired,
  piles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired))).isRequired,
  cardsInRow: PropTypes.number.isRequired,
};

const DeckCard = ({ seat, deck, seatIndex, draft, view }) => {
  const { cardsInRow } = useContext(DisplayContext);
  const [username] = deck.seats[seatIndex].username.split(':');
  const draftSeatIndex = draft.seats.findIndex(({ name }) => name === username);
  console.log('draftSeatIndex', draftSeatIndex);
  const stackedDeck = seat.deck.slice();
  const stackedSideboard = seat.sideboard.slice();
  let sbCount = 0;
  for (const col of stackedSideboard[0]) {
    sbCount += col.length;
  }
  if (sbCount <= 0) {
    stackedSideboard.splice(0, stackedSideboard.length);
  }
  // Cut off empty columns at the end.
  let lastFull;
  for (const row of stackedDeck) {
    for (lastFull = row.length - 1; lastFull >= 0; lastFull--) {
      if (row[lastFull] && row[lastFull].length > 0) {
        break;
      }
    }
    const startCut = lastFull + 1;
    row.splice(startCut, row.length - startCut);
  }

  let lastFullSB;
  for (const row of stackedSideboard) {
    for (lastFullSB = row.length - 1; lastFullSB >= 0; lastFullSB--) {
      if (row[lastFullSB] && row[lastFullSB].length > 0) {
        break;
      }
    }
    const startCut = lastFullSB + 1;
    row.splice(startCut, row.length - startCut);
  }

  return (
    <Paper elevation={4}>
      <CardHeader>
        <Stack>
          <Typography variant="h4">{seat.name}</Typography>
          {!seat.bot && (
            <Typography variant="h6">
              Drafted by {seat.userid ? <a href={`/user/${seat.userid}`}>{seat.username}</a> : 'Anonymous'}
            </Typography>
          )}
        </Stack>
      </CardHeader>
      <Suspense fallback={<CircularProgress />}>
        {view === 'picks' &&
          (draft ? (
            <DecksPickBreakdown deck={deck} seatIndex={draftSeatIndex} draft={draft} />
          ) : (
            <h4>This deck does not have a related draft log.</h4>
          ))}
        {view === 'deck' && (
          <>
            <DeckStacksStatic piles={stackedDeck} cards={deck.cards} cardsInRow={cardsInRow} />
            {stackedSideboard && stackedSideboard.length > 0 && (
              <>
                <CardHeader className="border-bottom">
                  <h4>Sideboard</h4>
                </CardHeader>
                <DeckStacksStatic cardsInRow={cardsInRow} piles={stackedSideboard} cards={deck.cards} />
              </>
            )}
          </>
        )}
        {view === 'draftbot' &&
          (draft ? (
            <DraftbotBreakdown deck={deck} seatIndex={draftSeatIndex} draft={draft} />
          ) : (
            <h4>This deck does not have a related draft log.</h4>
          ))}
      </Suspense>
      <Markdown markdown={seat.description} />
      <div className="border-top">
        <CommentsSection parentType="deck" parent={deck._id} collapse={false} />
      </div>
    </Paper>
  );
};
DeckCard.propTypes = {
  seat: DraftSeatPropType.isRequired,
  view: PropTypes.string,
  draft: PropTypes.shape({
    cards: PropTypes.arrayOf(CardPropType).isRequired,
    seats: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired).isRequired,
  }).isRequired,
  deck: DeckPropType.isRequired,
  seatIndex: PropTypes.string.isRequired,
};
DeckCard.defaultProps = {
  view: 'deck',
};

export default DeckCard;
