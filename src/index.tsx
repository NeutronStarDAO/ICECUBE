import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {fontResize} from "./utils/fontResize";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import store from "./redux/store";
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {ProvideAuth} from "./utils/useAuth";
import "@nfid/identitykit/react/styles.css"

gsap.registerPlugin(useGSAP);
fontResize()
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        {/*<IdentityKitProvider*/}
        {/*  authType={IdentityKitAuthType.DELEGATION}*/}
        {/*  theme={IdentityKitTheme.LIGHT}*/}
        {/*  signerClientOptions={{*/}
        {/*    idleOptions: {*/}
        {/*      idleTimeout: 1000 * 60 * 30, // set to 30 minutes*/}
        {/*      disableDefaultIdleCallback: true // disable the default reload behavior*/}
        {/*    }*/}
        {/*  }}*/}
        {/*  signers={[NFIDW, InternetIdentity]}*/}
        {/*  featuredSigner={InternetIdentity}*/}
        {/*>*/}
        {/*  <ProvideAuth>*/}
        {/*    <App/>*/}
        {/*  </ProvideAuth>*/}
        {/*</IdentityKitProvider>*/}

        <ProvideAuth>
          <App/>
        </ProvideAuth>

      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
