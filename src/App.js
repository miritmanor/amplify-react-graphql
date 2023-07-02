import "./App.css";
import {
  Button, 
  withAuthenticator,
} from "@aws-amplify/ui-react";
import Products from "./pages/Products";
import StoreProducts from "./pages/StoreProducts";
import ApplyChanges from "./pages/applyChanges";
import Suppliers from "./pages/suppliers";
import Stores from "./pages/stores";
import Tabs from './components/tabs';


const App = ({ signOut }) => {
  const tabs = [
    {
      title: 'Main database',
      content: <Products />,
    },
    {
      title: 'Store products',
      content: <StoreProducts />,
    },
    {
      title: 'Apply to stores',
      content: <ApplyChanges />,
    },
    {
      title: 'Suppliers',
      content: <Suppliers />,
    },
    {
      title: 'Stores',
      content: <Stores />,
    },
  ];

  return (
    <div>
            <div><p><b>Commiz {process.env.REACT_APP_ENV} environment </b> </p></div>

    <Tabs tabs={tabs} />
    <div style={{ marginTop: '50px' }}>
        <Button size="small" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  )

};

export default withAuthenticator(App);
