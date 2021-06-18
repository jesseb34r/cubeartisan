import React from 'react';
import PropTypes from 'prop-types';
import CubePropType from 'proptypes/CubePropType';
import UserPropType from 'proptypes/UserPropType';

import { Col, Row } from 'reactstrap';
import CubesCard from 'components/CubesCard';
import CubeSearchNavBar from 'components/CubeSearchNavBar';
import DynamicFlash from 'components/DynamicFlash';
import MainLayout from 'layouts/MainLayout';
import RenderToRoot from 'utils/RenderToRoot';

const ExplorePage = ({ user, recents, featured, drafted, recentlyDrafted, loginCallback }) => {
  return (
    <MainLayout loginCallback={loginCallback} user={user}>
      <CubeSearchNavBar user={user} />
      <DynamicFlash />
      <Row>
        <Col lg={6} md={6} sm={12} xs={12}>
          <CubesCard title="Featured Cubes" className="mt-4" cubes={featured} />
          <CubesCard title="Recently Updated Cubes" className="mt-4" cubes={recents} />
        </Col>
        <Col lg={6} md={6} sm={12} xs={12}>
          <CubesCard title="Most Drafted Cubes" className="mt-4" cubes={drafted} />
          <CubesCard title="Recently Drafted Cubes" className="mt-4" cubes={recentlyDrafted} />
        </Col>
      </Row>
    </MainLayout>
  );
};

const cubesListProp = PropTypes.arrayOf(CubePropType);

ExplorePage.propTypes = {
  recents: cubesListProp.isRequired,
  featured: cubesListProp.isRequired,
  drafted: cubesListProp.isRequired,
  recentlyDrafted: cubesListProp.isRequired,
  user: UserPropType,
  loginCallback: PropTypes.string,
};

ExplorePage.defaultProps = {
  user: null,
  loginCallback: '/',
};

export default RenderToRoot(ExplorePage);
