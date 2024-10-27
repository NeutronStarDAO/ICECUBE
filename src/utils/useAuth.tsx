import React, {createContext, useContext, useEffect, useState} from "react";
import {PartialIdentity} from "@dfinity/identity";
import {Principal} from "@dfinity/principal";
import {message} from "antd";
import {rootFeedApi} from "../actors/root_feed";
import {getToAccountIdentifier} from "./util";
// @ts-ignore
import {useAgent, useIdentityKit} from "@nfid/identitykit/react";
import {Identity} from "@dfinity/agent";
import {CommonStore} from "./Store";

export type Theme = "light" | "dark" | "auto"
export const themeKey = "proton_theme"

export interface Props {
  readonly identity?: Identity | PartialIdentity;
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

export const useProvideAuth = (): Props => {
  const [userFeedCai, setUserFeedCai] = useState<Principal | undefined>()
  const [theme, setTheme] = useState<Theme>("auto");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [account, setAccount] = useState<string | undefined>(undefined)
  const {identity, user, disconnect, connect} = useIdentityKit()
  const agent = useAgent()
  const isAuth = !!identity
  const principal = user?.principal

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
    if (principal) {
      getFeedCai(principal)
      const ac = getToAccountIdentifier(principal)
      setAccount(ac)
    }
  }, [principal])


  const Context: Props = {
    identity,
    principal,
    logIn: connect,
    logOut: disconnect,
    userFeedCai,
    isAuth,
    isDark,
    setIsDark, setTheme, theme,
    account
  };
  CommonStore.actionSave({agent})
  return Context;
}

const props: Props = {
  identity: undefined,
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
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={Object.assign(auth)}>
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(authContext);
};
