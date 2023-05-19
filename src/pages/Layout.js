import { Outlet, Link } from "react-router-dom";
import "../App.css";

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/products">Main database</Link>
          </li>
          <li>
            <Link to="/storeproducts">Store products</Link>
          </li>
          <li>
            <Link to="/applyChanges">Apply changes to stores</Link>
          </li>
          <li>
            <Link to="/suppliers">Suppliers</Link>
          </li>
          <li>
            <Link to="/stores">Stores</Link>
          </li>
       </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;
