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
import PodcastPropType from '@hypercube/client/proptypes/PodcastPropType';

import CommentsSection from '@hypercube/client/components/CommentsSection';
import PodcastEpisodePreview from '@hypercube/client/components/PodcastEpisodePreview';
import AspectRatioBox from '@hypercube/client/components/AspectRatioBox';

import { CardBody, CardHeader, Row, Col } from 'reactstrap';

const Podcast = ({ podcast, episodes }) => {
  return (
    <>
      <CardHeader>
        <h1>{podcast.title}</h1>
        <h6>
          By <a href={`/user/view/${podcast.owner}`}>{podcast.username}</a>
        </h6>
      </CardHeader>
      <Row>
        <Col xs="12" sm="4">
          <AspectRatioBox ratio={1} className="text-ellipsis">
            <img className="w-100" alt={podcast.title} src={podcast.image} />
          </AspectRatioBox>
        </Col>
        <Col xs="12" sm="8">
          <CardBody dangerouslySetInnerHTML={{ __html: podcast.description }} />
        </Col>
      </Row>
      <CardBody className="border-top">
        {episodes.length <= 0 ? (
          <p>No episodes available. Check back later for new episodes!</p>
        ) : (
          <Row>
            {episodes.map((episode) => (
              <Col xs="12" sm="6" md="3" className="pb-3">
                <PodcastEpisodePreview episode={episode} />
              </Col>
            ))}
          </Row>
        )}
      </CardBody>
      <div className="border-top">
        <CommentsSection parentType="podcast" parent={podcast._id} collapse={false} />
      </div>
    </>
  );
};
Podcast.propTypes = {
  podcast: PodcastPropType.isRequired,
  episodes: PropTypes.arrayOf(PropTypes.shape({})),
};

Podcast.defaultProps = {
  episodes: [],
};

export default Podcast;