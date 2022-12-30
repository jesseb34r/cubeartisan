import { Outlet } from 'solid-start';

import SiteFooter from '@cubeartisan/cubeartisan/components/templates/App/SiteFooter';
import SiteNavbar from '@cubeartisan/cubeartisan/components/templates/App/SiteNavbar';
import { atoms } from '@cubeartisan/cubeartisan/styles';

const AppLayout = () => (
  <>
    <div
      class={atoms({
        minHeight: 'screenH',
      })}
    >
      <SiteNavbar />
      <Outlet />
    </div>
    <SiteFooter />
  </>
);
export default AppLayout;