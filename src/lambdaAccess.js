import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';

const LAMBDA_NAME='commiz-admin';
const REGION='us-east-1';
const BASEURL="https://p2qa0zr9n5.execute-api.us-east-1.amazonaws.com/dev/";  // API gateway URL
  export  function getBaseURL() {
      console.log("in getBaseURL");
      return (BASEURL);
  }

  export async function fetchProducts(setProducts) {
    //const apiData = await API.graphql({ query: listNotes });
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


  export async function fetchStores(setStores) {
  
    var commizurl = BASEURL + 'stores';

    fetch(commizurl)
       .then(response => response.json())
       .then(data => {
           console.log(data);
           setStores(data);
       })

  }

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


export async function invokeLambdaDirectly(httpMethod,resource,path,pathParameters,queryStringParameters,body) {

    AWS.config.update({region:REGION});
    const user = await Auth.currentAuthenticatedUser();
    const { accessToken, idToken } = user.signInUserSession;
    //var credentials = await Auth.currentCredentials();
    //console.log('AWS.config: ',AWS.config);
    const credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:5cd31dc5-c24d-47b3-bce4-d391c8c7c328",
        Logins: {
          [`cognito-idp.us-east-1.amazonaws.com/us-east-1_UgXyFOAqT`]: idToken.jwtToken,
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
    try {
      const payload= JSON.parse(res.Payload);
      if (res.StatusCode != 200) {
          return("Failed "+payload);
      } else {
          const body=JSON.parse(payload.body);
            if (typeof body ==='string') {
              return(body);
            } 
            else {
              if (body.length == 0) {
                // empty results
                return("no results to show");
              } else {
                return("");
              }
          }
      }
    } catch (error) {
      console.log(error);
      return(error);
    }
  }
  
