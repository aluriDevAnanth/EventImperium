import { Outlet } from 'react-router';
import Header from './Header';

function OutletC() {
  return (
    <>
      <Header />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default OutletC;
