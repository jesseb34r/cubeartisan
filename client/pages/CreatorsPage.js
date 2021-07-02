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

import { Nav, CardHeader, Card, TabContent, TabPane } from 'reactstrap';

import DynamicFlash from '@hypercube/client/components/DynamicFlash';
import Tab from '@hypercube/client/components/Tab';
import CreatorArticles from '@hypercube/client/components/CreatorArticles';
import CreatorVideos from '@hypercube/client/components/CreatorVideos';
import CreatorPodcasts from '@hypercube/client/components/CreatorPodcasts';
import useQueryParam from '@hypercube/client/hooks/useQueryParam';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';

const CreatorsPage = ({ loginCallback }) => {
  const [tab, setTab] = useQueryParam('tab', '0');

  return (
    <MainLayout loginCallback={loginCallback}>
      <Card className="pb-3">
        <CardHeader>
          <h5>Content Creator Dashboard</h5>
        </CardHeader>
        <Nav className="mt-3" tabs justified>
          <Tab tab={tab} setTab={setTab} index="0">
            Articles
          </Tab>
          <Tab tab={tab} setTab={setTab} index="1">
            Podcasts
          </Tab>
          <Tab tab={tab} setTab={setTab} index="2">
            Videos
          </Tab>
        </Nav>
        <DynamicFlash />
        <TabContent activeTab={tab}>
          <TabPane tabId="0">
            <CreatorArticles />
          </TabPane>
          <TabPane tabId="1">
            <CreatorPodcasts />
          </TabPane>
          <TabPane tabId="2">
            <CreatorVideos />
          </TabPane>
        </TabContent>
      </Card>
    </MainLayout>
  );
};

CreatorsPage.propTypes = {
  loginCallback: PropTypes.string,
};

CreatorsPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(CreatorsPage);
