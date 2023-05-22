import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';

const LAMBDA_NAME=process.env.REACT_APP_LAMBDA_FUNCTION;
const REGION=process.env.REACT_APP_REGION;
const BASEURL=process.env.REACT_APP_API_GATEWAY_URL;  // API gateway URL
const IDENTITY_POOL_ID=process.env.REACT_APP_IDENTITY_POOL_ID;
const COGNITO_IDP=process.env.REACT_APP_COGNITO_IDP;

  export  function getBaseURL() {
      console.log("in getBaseURL");
      return (BASEURL);
  }

  export async function fetchProducts(setProducts) {
    console.log(BASEURL);
    console.log(REGION);
    var commizurl = BASEURL + 'products';
    /*
    if (supplier != "") {
        commizurl += '?supplier='+supplier;
    }
    */
    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setProducts(data);
       })

  }

  export async function fetchProduct(sku) {
    var commizurl = BASEURL + 'products/' + sku;

    console.log("In fetchProduct ",commizurl);
    const res = await fetch(commizurl)
    return res.json();
    /* 
       .then(response => response.json())
       .then(data => {
           console.log("data:",data);
           return(data);
       })
       */

  }

  export async function modifyProduct(sku,changes) {
    var commizurl = BASEURL + 'products/' + sku + '?';

    if (changes.length === 0) {
      console.log("nothing to change");
      return {};
    }
    var first=true;
    for (var attr in changes) {
      if (!first) {
        commizurl = commizurl + '&';
      }
      commizurl = commizurl + attr + '=' + changes[attr];
      first=false;
    }
    console.log("In modifyProduct ",commizurl);
    try {
      const res = await fetch(commizurl,{method: "PUT"});
      const result = await res.json();
      console.log(result);
      return (result);
    }
    catch (err) {
      return("result: " +err);
    }

    /* 
       .then(response => response.json())
       .then(data => {
           console.log("data:",data);
           return(data);
       })
       */

  }

  export async function fetchStores(setStores) {
  
    var commizurl = BASEURL + 'stores';

    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setStores(data);
       })

  }

  export async function fetchSuppliers(setSuppliers,storeName) {
  
    var store="";
    if (storeName !== "") {
      store =  '?storeName=' + storeName;
    }
    var commizurl = BASEURL + 'suppliers' + store;

    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setSuppliers(data);
       })

  }

  export async function fetchSuppliersFullDetails(setSuppliers) {
  

    var commizurl = BASEURL + 'suppliers?fullDetails=1';

    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setSuppliers(data);
       })

  }
/*
  async function authenticateSDK() {
    try {
    const user = await Auth.currentAuthenticatedUser();
    const { accessToken, idToken } = user.signInUserSession;
    const credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'YOUR_IDENTITY_POOL_ID',
      Logins: {
        [`cognito-idp.${process.env.REACT_APP_REGION}.amazonaws.com/${process.env.REACT_APP_USER_POOL_ID}`]: idToken.jwtToken,
      },
      region: process.env.REACT_APP_REGION,
    });
    await credentials.getPromise();
    AWS.config.credentials = credentials;
  } catch (error) {
    console.log('Error authenticating to AWS SDK', error);
  }
}
*/

export async function invokeLambdaDirectly(httpMethod,resource,path,pathParameters,queryStringParameters,body) {

    AWS.config.update({region:REGION});
    const user = await Auth.currentAuthenticatedUser();
    // eslint-disable-next-line
    const { accessToken, idToken } = user.signInUserSession;
    //var credentials = await Auth.currentCredentials();
    console.log('AWS.config: ',AWS.config);
    console.log("idToken:",idToken);
    const credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID,
        Logins: {
          [COGNITO_IDP]: idToken.jwtToken,
        },
        region: REGION,
      });
    await credentials.getPromise();
    AWS.config.credentials = credentials;

    const lambda = new AWS.Lambda({
       region: REGION, 
       apiVersion: '2015-03-31',
       //credentials: Auth.essentialCredentials(credentials)
       credentials: credentials
     });
   
    const params = {
      FunctionName: LAMBDA_NAME,
      Payload: JSON.stringify({
            'httpMethod':httpMethod,
            'resource':resource,
            'path': path,
            'pathParameters': pathParameters,
            'resourcePath': resource,
            'queryStringParameters': queryStringParameters,
            'body': body
      }),
    };
    
    try {
        console.log("invoking lambda now");
        console.log(params);
        const response = await lambda.invoke(params).promise();
        console.log(response);
        return(response);
    } catch (error) {
        console.error(error);
    }
  }

  export function checkServerResponse(res) {
    console.log(res);
    
    var displayMessage="";
    try {
      switch (typeof res) {
        case 'object':
          if (res.StatusCode !== 200) {
            displayMessage = "Failed "+res.toString();
          }
          if (res.hasOwnProperty('Payload')) {
            console.log(res.Payload);
            console.log(typeof res.Payload);
            if (typeof res.Payload == 'string') {
              try {
                const payload= JSON.parse(res.Payload);
                try {
                  // eslint-disable-next-line
                  const body=JSON.parse(payload.body);
                  console.log("suucessfully parsed body")
                  displayMessage="";  // empty message is a sign for success
                } catch (err) {
                  console.log("failed to parse body");
                  console.log("returning payload ",payload)
                  displayMessage = JSON.stringify(payload);
                }
              } catch (error) {
                console.log("Failed to parse payload");
                displayMessage = res.Payload;
              }
            }
          }
          break;
        case 'string':
          displayMessage = res;
          break;
        default:
          displayMessage = res;
      }
    } catch (error) {
        console.log(error);
        displayMessage = error;
    } finally {
      console.log("displayMessage:",displayMessage);
      console.log("as a string:",displayMessage.toString());
      return displayMessage.toString();
    }
  }
  
