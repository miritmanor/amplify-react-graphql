import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/products">Products</Link>
          </li>
          <li>
            <Link to="/upload">Upload</Link>
          </li>       
       </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;
