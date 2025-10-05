import React, { useState, useMemo } from 'react';
import '../../App.css';
import { Wrapper } from "../../commonComponents/Wrapper/Wrapper.Component"
import styles from "./Home.Style"
import APITester from '../APITester/APITester.Component';
import { useDispatch, useSelector } from 'react-redux';

function Home() {
  const classess = styles()
  const component = useSelector(state => state.sideBarReducer.component)

  const mainComponent = useMemo(() => {
    switch (component) {
      case "API_TESTER": return <APITester />
      default: return <></>
    }
  })

  return (
    <Wrapper>
      {mainComponent}
    </Wrapper>
  );
}

export default Home;
