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
import PropTypes from 'prop-types';
import CubePropType from '@hypercube/client/proptypes/CubePropType';
import DeckPropType from '@hypercube/client/proptypes/DeckPropType';

import { Card, CardBody, CardHeader } from 'reactstrap';

import DeckPreview from '@hypercube/client/components/DeckPreview';
import Paginate from '@hypercube/client/components/Paginate';
import CubeLayout from '@hypercube/client/layouts/CubeLayout';
import DynamicFlash from '@hypercube/client/components/DynamicFlash';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';

const CubeDecksPage = ({ cube, decks, pages, activePage, loginCallback }) => (
  <MainLayout loginCallback={loginCallback}>
    <DynamicFlash />
    <CubeLayout cube={cube} activeLink="playtest">
      <div className="my-3">
        {pages > 1 && <Paginate count={pages} active={activePage} urlF={(i) => `/cube/deck/decks/${cube._id}/${i}`} />}
        <Card>
          <CardHeader>
            <h5 className="mb-0">All Decks</h5>
          </CardHeader>
          <CardBody className="p-0">
            {decks.map((deck) => (
              <DeckPreview key={deck._id} deck={deck} nextURL={`/cube/deck/decks/${cube._id}/${activePage}`} />
            ))}
          </CardBody>
        </Card>
        {pages > 1 && <Paginate count={pages} active={activePage} urlF={(i) => `/cube/deck/decks/${cube._id}/${i}`} />}
      </div>
    </CubeLayout>
  </MainLayout>
);

CubeDecksPage.propTypes = {
  cube: CubePropType.isRequired,
  decks: PropTypes.arrayOf(DeckPropType).isRequired,
  pages: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  loginCallback: PropTypes.string,
};

CubeDecksPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(CubeDecksPage);