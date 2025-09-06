"use client";
import React from "react";
import styled from "styled-components";

export default function CommonBTN() {
  return (
    <StyledWrapper>
      <button>
        <span> Next</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* From uiverse.io by @Ali-Tahmazi99 */
  button {
    display: inline-block;
    width: 100px;
    height: 100%;
    border-radius: 10px;
    border: 1px solid #03045e;
    position: relative;
    overflow: hidden;
    transition: all 0.5s ease-in;
    z-index: 1;
  }

  button::before,
  button::after {
    content: "";
    position: absolute;
    top: 0;
    width: 0;
    height: 100%;
    transform: skew(15deg);
    transition: all 0.5s;
    overflow: hidden;
    z-index: -1;
  }

  button::before {
    left: -15px;
    background: #240046;
  }

  button::after {
    right: -15px;
    background: #5a189a;
  }

  button:hover::before,
  button:hover::after {
    width: 66%;
  }

  button:hover span {
    color: #e0aaff;
    transition: 0.3s;
  }

  button span {
    color: #03045e;
    font-size: 18px;
    transition: all 0.3s ease-in;
  }
`;
