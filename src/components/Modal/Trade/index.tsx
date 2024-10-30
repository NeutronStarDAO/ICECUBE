import "./index.scss"
import React, {useEffect} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {useAuth} from "../../../utils/useAuth";
import {NumberInput} from "../../Common";

export const Trade = ({open, setOpen, type, api, amount, setAmount, icpAmount, balance, gettingPrice}: {
  open: boolean,
  setOpen: Function,
  type: "buy" | "sell",
  api: Function,
  amount: number,
  setAmount: Function,
  icpAmount: number,
  balance?: number, gettingPrice: boolean
}) => {

  const {isDark} = useAuth()

  const cantStyle = {
    backgroundColor: "gray",
    cursor: "not-allowed"
  }

  useEffect(() => {
    setAmount(0)
  }, [open]);

  return <Modal setOpen={setOpen} open={open}>
    <div className={"trade_modal"}>
      <div className={`receive_title ${isDark ? "dark_receive_title" : ""}`}>
        <Icon name={"grant"}/>
        {type === "buy" ? "Buy" : "Sell"}
      </div>

      <div className={`token ${isDark ? "dark_token" : ""}`}>
        Cubes
      </div>
      {balance !== undefined && <>
        <div className={"amount_select"}>
          Balance
        </div>
        <div className={`token ${isDark ? "dark_token" : ""}`}>
          {balance + " cubes"}
        </div>
      </>}
      <div className={"amount_select"}>
        Amount
      </div>
      <div className={"amount_select"}>
        <NumberInput integer={true} setAmount={setAmount} value={amount}/>
      </div>
      <span style={{textAlign: "start", fontSize: "1.6rem"}}>≈{icpAmount}ICP</span>
      <div style={(balance !== undefined && amount > balance) || gettingPrice ? cantStyle : {}} className={"done_button"}
           onClick={api as any}>
        Done
      </div>
    </div>
  </Modal>
}
