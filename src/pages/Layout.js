import { Outlet, Link } from "react-router-dom";
import "../App.css";

const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/products">Products (main database)</Link>
          </li>
          <li>
            <Link to="/storeproducts">Products (in store)</Link>
          </li>
          <li>
            <Link to="/upload">Upload changes file</Link>
          </li>       
          <li>
            <Link to="/compareToStore">View differences</Link>
          </li>
          <li>
            <Link to="/applyChanges">Apply changes to stores</Link>
          </li>
       </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;
