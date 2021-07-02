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

import UserLayout from '@hypercube/client/layouts/UserLayout';
import BlogPost from '@hypercube/client/components/BlogPost';
import Paginate from '@hypercube/client/components/Paginate';
import DynamicFlash from '@hypercube/client/components/DynamicFlash';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';

const UserBlogPage = ({ followers, following, posts, owner, loginCallback, pages, activePage }) => (
  <MainLayout loginCallback={loginCallback}>
    <UserLayout user={owner} followers={followers} following={following} activeLink="blog">
      <DynamicFlash />

      {pages > 1 && (
        <Paginate count={pages} active={parseInt(activePage, 10)} urlF={(i) => `/user/blog/${owner._id}/${i}`} />
      )}
      {posts.length > 0 ? (
        posts.slice(0).map((post) => <BlogPost key={post._id} post={post} loggedIn />)
      ) : (
        <p>This user has no blog posts!</p>
      )}

      {pages > 1 && (
        <Paginate count={pages} active={parseInt(activePage, 10)} urlF={(i) => `/user/blog/${owner._id}/${i}`} />
      )}
    </UserLayout>
  </MainLayout>
);

UserBlogPage.propTypes = {
  owner: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  followers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  following: PropTypes.bool.isRequired,
  posts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  pages: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  loginCallback: PropTypes.string,
};

UserBlogPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(UserBlogPage);