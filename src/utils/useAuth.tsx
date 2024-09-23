import React, {createContext, useContext, useEffect, useState} from "react";
import {authClient, IIForIdentity} from "./IIForIdentity";
import {DelegationIdentity} from "@dfinity/identity";
import {Principal} from "@dfinity/principal";
import {message, notification} from "antd";
import {NotificationInstance} from "antd/es/notification/interface";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";
import {rootFeedApi} from "../actors/root_feed";
import {getToAccountIdentifier} from "./util";

export type Theme = "light" | "dark" | "auto"
export const themeKey = "proton_theme"

export interface Props {
  readonly identity: DelegationIdentity | undefined;
  readonly isAuthClientReady: boolean;
  readonly principal: Principal | undefined;
  readonly userFeedCai: Principal | undefined
  readonly logOut: Function | undefined;
  readonly logIn: Function | undefined;
  readonly isAuth: boolean | undefined;
  readonly isDark: boolean;
  readonly setIsDark: Function;
  readonly setTheme: Function
  readonly theme: Theme
  readonly account?: string
}

export const useProvideAuth = (authClient: IIForIdentity): Props => {
  const [_identity, _setIdentity] = useState<DelegationIdentity | undefined>(undefined);
  const [isAuthClientReady, setAuthClientReady] = useState(false);
  const [principal, setPrincipal] = useState<Principal | undefined>(undefined);
  const [userFeedCai, setUserFeedCai] = useState<Principal | undefined>()
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>("auto");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [account, setAccount] = useState<string | undefined>(undefined)

  if (!isAuthClientReady) authClient.create().then(() => setAuthClientReady(true));

  const handleColorSchemeChange = (event: any) => {
    setIsDark(event.matches);
  };

  const initTheme = () => {
    // 初始化时检查颜色主题
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    // 监听颜色主题变化
    mediaQuery.addEventListener('change', handleColorSchemeChange);

    // 清理事件监听器
    return () => {
      mediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }

  useEffect(() => {
    const storageTheme = localStorage.getItem(themeKey)
    if (storageTheme === null || storageTheme === "auto") {
      setTheme("auto")
      initTheme()
    } else if (storageTheme === "dark") {
      setTheme("dark")
      setIsDark(true)
    } else if (storageTheme === "light") {
      setTheme("light")
      setIsDark(false)
    } else {
      initTheme()
      localStorage.removeItem(themeKey)
    }
  }, [theme]);


  const init = async () => {
    const [identity, isAuthenticated] = await Promise.all([
      authClient.getIdentity(),
      authClient.isAuthenticated(),
    ])
    if (!isAuthenticated) return setAuthenticated(false)
    const principal = identity?.getPrincipal() as Principal | undefined;
    setPrincipal(principal);
    _setIdentity(identity as DelegationIdentity | undefined);
    setAuthenticated(true);
    setAuthClientReady(true);
  }
  useEffect(() => {
    isAuthClientReady && init().then()
  }, [isAuthClientReady]);

  const getFeedCai = async (principal: Principal) => {
    const e = await rootFeedApi.getUserFeedCanister(principal)
    let cai = e
    if (!e) {
      try {
        cai = await rootFeedApi.init_user_feed()
      } catch (e) {
        message.error('Create Failed !')
      }
    }
    setUserFeedCai(cai)
  }
//aa3zr-2je3k-6vmid-vj657-x36hs-ylxag-e2jd5-pufmf-hh26e-uttum-rae
  useEffect(() => {
    if (principal && authenticated) {
      getFeedCai(principal)
      const ac = getToAccountIdentifier(principal)
      setAccount(ac)
    }
  }, [principal, authenticated])

  const logIn = async (): Promise<{ message?: string; status?: number } | undefined> => {
    try {
      if (!authClient) return {message: "connect error"};
      const identity = await authClient.login();
      const principal = identity.getPrincipal();
      setPrincipal(principal);
      if (identity) {
        _setIdentity(_identity);
        setAuthenticated(true);
      } else {
        setAuthenticated(false)
        return {message: "connect error"};
      }
    } catch (e) {
      console.warn(e)
    }
  };

  const logOut = async (): Promise<void> => {
    await authClient.logout();
    setAuthenticated(false);
  };


  const Context: Props = {
    identity: _identity,
    isAuthClientReady,
    principal,
    logIn,
    logOut,
    userFeedCai,
    isAuth: authenticated,
    isDark,
    setIsDark, setTheme, theme,
    account
  };
  return Context;
}

const props: Props = {
  identity: undefined,
  isAuthClientReady: false,
  principal: undefined,
  logIn: undefined,
  logOut: undefined,
  isAuth: false,
  userFeedCai: undefined,
  isDark: false, theme: "auto",
  setIsDark: () => {
  }, setTheme: () => {
  },
  account: undefined
}

const authContext = createContext(props);

export function ProvideAuth({children}: any) {
  const auth = useProvideAuth(authClient);
  return (
    <authContext.Provider value={Object.assign(auth)}>
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(authContext);
};
