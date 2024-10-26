import "./index.scss"

import React, {useEffect, useState} from "react"
import Icon from "../../Icons/Icon";
import {useAuth} from "../../utils/useAuth";
import {Receive} from "../../components/Modal/Receive";
import {Send} from "../../components/Modal/Send";
import {ledgerApi} from "../../actors/ledger";
import {ckBTCApi} from "../../actors/ckbtc";

export const Wallet = () => {
  return <div className={"wallet_main"}>
    <div className={"title"}>Wallet</div>
    <Balance/>

    <Holding/>
  </div>
}


const Holding = React.memo(() => {
  return <div className={"wallet_holding"}>
    <span className={"title"}>
      Holding
    </span>
    <div className={"card_wrap"}>
      <Cubes/>
    </div>
  </div>
})

const CubeCard = ({image, cubes, textOverlay}: { image: string, cubes: number, textOverlay: string }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="cube-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="cube-content">
        {(hover && textOverlay) || !image && (
          <div style={{backgroundColor: !image ? "inherit" : "rgba(0, 0, 0, 0.4)"}} className="overlay">
            <p style={{color: !image ? "black" : "white"}}>{textOverlay}</p>
          </div>
        )}
        {image && <img src={image} alt={`Cube ${cubes}`}/>}
      </div>
      <div className="cube-label">{cubes} Cubes</div>
    </div>
  );
};

const Cubes = () => {
  return (
    <div className="cube-container">
      {new Array(7).fill(0).map((v, k) => {
        return <CubeCard
          image=""
          cubes={20}
          textOverlay="aaa"
          key={k}
        />
      })}

    </div>
  );
};


const Balance = () => {
  const {principal, isAuth} = useAuth()
  const [balances, setBalance] = React.useState<bigint[]>([])
  const {isDark} = useAuth()
  const [spin, setSpin] = React.useState(false)

  const getBalance = async () => {
    setSpin(true)
    if (principal && isAuth) {
      Promise.all([ckBTCApi.ckBTCBalance(principal), ledgerApi.icpBalance(principal)]).then(e => {
        setBalance(e)
        setSpin(false)
      })
    }
  }
  useEffect(() => {
    getBalance()
  }, [principal, isAuth])

  return <div className={`balance ${isDark ? "dark_balance" : ""}`}>
    <div className={"title"}>
       <span>
        Token
      </span>
      <span style={{flex: "1", display: "flex", alignItems: "center", justifyContent: 'center', gap: "1rem"}}>
        Balance
          <img className={spin ? "loading" : ""} onClick={getBalance}
               src={isDark ? "/refresh_light.png" : "/refresh.png"} alt=""/>
      </span>
      <span style={{flex: "1"}}>
        Transactions
      </span>
    </div>
    <Token getBalance={getBalance} token={"ckBTC"} balance={Number(balances[0]) / 1e8} filePath={"/img_4.png"}/>
    <Token getBalance={getBalance} token={"ICP"} balance={Number(balances[1]) / 1e8} filePath={"/img_6.png"}/>
  </div>
}

const Token = ({filePath, balance, token, getBalance}: {
  filePath: string,
  balance: number,
  token: string, getBalance: Function
}) => {
  const [openReceive, setOpenReceive] = React.useState(false)
  const [openSend, setOpenSend] = React.useState(false)
  const {account, principal} = useAuth()
  const [icpLoading, setIcpLoading] = React.useState(false)
  const [ckbtcLoading, setCkbtcLoading] = React.useState(false)
  return <div className={"token_item"}>
    <Receive token={token} account={token === "ICP" ? account ?? "" : ""}
             principalId={principal ? principal.toString() : ""}
             open={openReceive}
             setOpen={setOpenReceive}/>
    <Send setIcpLoading={setIcpLoading} setCkbtcLoading={setCkbtcLoading} getBalance={getBalance} token={token}
          balance={balance} open={openSend} setOpen={setOpenSend}/>
    <img src={filePath} alt=""/>
    <span style={{flex: "1"}}>{balance.toFixed(3)}</span>
    <span style={{flex: "1"}}>
      <span className={"record_wrap"}
            onClick={() => {
              if (token === "ICP") window.open(`https://dashboard.internetcomputer.org/account/${account}`)
              else if (token === "ckBTC") window.open(`https://dashboard.internetcomputer.org/ethereum/mxzaz-hqaaa-aaaar-qaada-cai/account/${principal?.toString()}`)
            }}>
        <Icon name={"record"}/>
      </span>
    </span>
    <div className={"token_button_wrap"} style={{display: "flex", alignItems: "center", gap: "2rem", width: "40%"}}>
      <span className={"receive"} onClick={() => {
        setOpenReceive(true)
      }}>Receive</span>
      <span
        style={{cursor: (token === "ICP" && icpLoading) || (token === "ckBTC" && ckbtcLoading) ? "no-drop" : "pointer"}}
        className={"send"}
        onClick={() => {
          if ((token === "ICP" && icpLoading) || (token === "ckBTC" && ckbtcLoading)) return
          setOpenSend(true)
        }}>Send</span>
    </div>
  </div>
}
