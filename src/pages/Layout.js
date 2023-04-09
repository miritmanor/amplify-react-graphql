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
            <Link to="/changes">View and apply changes</Link>
          </li>
       </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;
