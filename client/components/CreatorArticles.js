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
import { useState, useEffect, useContext } from 'react';

import { Navbar, Nav, NavItem, NavLink, Row, Col, CardBody } from 'reactstrap';

import Loading from '@hypercube/client/pages/Loading';
import UserContext from '@hypercube/client/contexts/UserContext';
import ArticlePreview from '@hypercube/client/components/ArticlePreview';
import Paginate from '@hypercube/client/components/Paginate';
import { csrfFetch } from '@hypercube/client/utils/CSRF';
import useQueryParam from '@hypercube/client/hooks/useQueryParam';

const PAGE_SIZE = 24;

const CreatorArticles = () => {
  const user = useContext(UserContext);

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useQueryParam('page', '0');
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await csrfFetch(`/content/api/articles/${user.id}/${page}`);
      if (!response.ok) {
        console.log(response);
      }
      const json = await response.json();

      setPages(Math.ceil(json.numResults / PAGE_SIZE));
      setArticles(json.articles);
      setLoading(false);
    };
    fetchData();
  }, [page, user]);

  const updatePage = (index) => {
    setLoading(true);
    setPage(index);
  };

  return (
    <>
      <Navbar light expand className="usercontrols mb-3">
        <Nav navbar>
          <NavItem>
            <NavLink href="/content/newarticle" className="clickable">
              Create New Article
            </NavLink>
          </NavItem>
        </Nav>
      </Navbar>
      {pages > 1 && (
        <CardBody className="pt-0">
          <Paginate count={pages} active={page} onClick={(i) => updatePage(i)} />
        </CardBody>
      )}
      {loading ? (
        <Loading />
      ) : (
        <Row className="px-3">
          {articles.map((article) => (
            <Col xs="12" sm="6" md="4" lg="3" className="mb-3">
              <ArticlePreview article={article} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default CreatorArticles;
