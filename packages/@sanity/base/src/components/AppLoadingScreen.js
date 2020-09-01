/* eslint-disable max-len */
import PropTypes from 'prop-types'
import React from 'react'

const AppLoadingScreenStyles = `
.sanity-app-loading-screen__root {
  -webkit-font-smoothing: antialiased;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  background-color: #e4e8ed;
  color: #66758d;
  display: block;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}

.sanity-app-loading-screen__inner {
  position: fixed;
  top: 50vh;
  left: 50vw;
  -webkit-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
  text-align: center;
}

.sanity-app-loading-screen__text {
  margin-top: 7rem;
  font-size: 13px;
}

.sanity-app-loading-screen__contentStudioLogo {
  display: block;
  top: 50vh;
  left: 50vw;
  position: absolute;
  width: 4rem;
  height: 4rem;
  transform: translate(-50%, -50%);
}
`

export default class AppLoadingScreen extends React.PureComponent {
  static propTypes = {
    text: PropTypes.string
  }

  static defaultProps = {
    text: 'Loading Content Studio'
  }

  render() {
    return (
      <div className="sanity-app-loading-screen__root">
        <style type="text/css">{AppLoadingScreenStyles}</style>
        <svg
          className="sanity-app-loading-screen__contentStudioLogo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          shapeRendering="geometricPrecision"
        >
          <style>
            {`
            @keyframes contentStudioLogoRed2_o {
              0%,60.9375%,85.9375%,to{opacity:1}75%{opacity:0}
            }
            @keyframes contentStudioLogoRed2_d{
              0%,to{d:path('M31.8198,-0.152887C14.6198,-0.152887,-0.180693,5.34827,-0.180693,14.0483C-0.180693,14.0483,-0.116819,18.8939,-0.116819,27.9939C-0.116819,12.1939,23.9411,11.0675,31.8411,11.0675C39.7411,11.0675,63.8319,12.3036,63.8319,28.0036C63.8433,21.007,63.8093,17.833,63.8093,14.033C63.8093,5.23298,49.0198,-0.152887,31.8198,-0.152887Z')}26.5625%{d:path('M31.8038,13.9517C14.6038,13.9517,10.3384,14.018,-0.161616,14.018C-0.161616,14.018,-0.18039,21.0207,-0.171003,27.9952C10.6334,28.8307,24.0402,28.1057,31.9402,28.1057C39.8402,28.1057,53.3294,28.0328,63.8294,28.0328C63.8106,21.0113,63.8012,17.818,63.8012,14.018C54.3012,14.018,49.0038,13.9517,31.8038,13.9517Z')}50%{d:path('M31.8198,33.7067C14.6198,33.7067,-0.0937039,20.8851,-0.0937039,14.0532C-0.0937039,14.0532,-0.140498,18.851,-0.140498,27.951C-0.140498,38.951,23.9198,44.4693,31.8198,44.4693C39.7198,44.4693,63.7768,38.3882,63.7768,27.8882C63.7768,20.8189,63.7768,17.7433,63.7768,13.9433C63.7768,27.9433,49.0198,33.7067,31.8198,33.7067Z')}75%{d:path('M31.7785,53.0303C14.5785,53.0303,-0.194251,38.8008,-0.194251,21.0008C-0.194251,21.0008,-0.194251,20.9734,-0.194251,20.9734C-0.194251,39.7734,15.7579,53.0509,31.7579,53.0509C50.6512,53.0509,63.839,36.9524,63.839,21.0524C63.9008,21.0317,63.7857,21.0175,63.8462,21.0434C63.8462,39.1815,48.9785,53.0303,31.7785,53.0303Z')}76.5625%{d:path('M31.7399,-10.957C14.5399,-10.957,-0.222851,3.37264,-0.222851,21.0664C-0.222851,21.0664,-0.222851,20.6239,-0.222851,21.0664C-0.222851,5.48596,12.6065,-10.957,31.6599,-10.957C50.7326,-10.957,63.8248,5.31515,63.8248,21.0152C63.8248,21.0152,63.8158,21.0789,63.8248,21.0152C63.8248,3.42599,48.9399,-10.957,31.7399,-10.957Z')}}@keyframes contentStudioLogoBlue1_o{0%,60.9375%,85.9375%,to{opacity:1}75%{opacity:0}}
            @keyframes contentStudioLogoBlue1_d{
              0%,to{d:path('M31.9068,-0.289009C14.7068,-0.289009,-0.09946,7.34292,-0.09946,16.0429C-0.09946,16.0429,-0.09946,20.9443,-0.09946,30.0443C-0.09946,14.2443,23.9888,11.047,31.8888,11.047C39.7888,11.047,63.8771,16.0398,63.8771,30.0443C63.8932,23.0516,63.9012,19.867,63.9012,16.067C63.9012,7.26694,49.1068,-0.289009,31.9068,-0.289009Z')}26.5625%{d:path('M32,16C14.8,16,10.5,16,0,16C0,16,0,20.9,0,30C11,30,24.1,30,32,30C39.9,30,53.5,30,64,30C63.8,25.7,64,19.8,64,16C54.5,16,49.2,16,32,16Z')}50%{d:path('M32,35C14.8,35,0,30,0,16C0,16,0,20.9,0,30C0,41,24.1,46,32,46C39.9,46,64,40.5,64,30C63.8,25.7,64,19.8,64,16C64,30,49.2,35,32,35Z')}75%{d:path('M31.9179,55.0576C14.7179,55.0576,0,41,0,23.2C0,23.2,0,23.2,0,23.2C0,42,15.9179,55.0576,31.9179,55.0576C50.9179,55.0576,64,38.9,64,23C63.8,18.7,64,26.8,64,23C64,40.6,49.1179,55.0576,31.9179,55.0576Z')}76.5625%{d:path('M32,-9C14.8,-9,0,4.5,0,23C0,23,0,13.9,0,23C0,7.2,12.5,-9,32,-9C51.5,-9,64,7.3,64,23C63.8,18.7,64,26.8,64,23C64,5,49.2,-9,32,-9Z')}}
            @keyframes contentStudioLogoBlue2_o{
                0%,60.9375%,85.9375%,to{opacity:1}75%{opacity:0}}
            @keyframes contentStudioLogoBlue2_d{
              0%,to{d:path('M32,0C14.8,0,0,7.3,0,16C0,16,0,20.9,0,30C0,14.2,23.3,11.1,31.2,11.1C39.1,11.1,64,14.3,64,30C63.8,25.7,64,19.8,64,16C64,7.19996,49.2,0,32,0Z')}26.5625%{d:path('M32,16C14.8,16,10.5,16,0,16C0,16,0,20.9,0,30C11,30,24.1,30,32,30C39.9,30,53.5,30,64,30C63.8,25.7,64,19.8,64,16C54.5,16,49.2,16,32,16Z')}50%{d:path('M32,35C14.8,35,0,30,0,16C0,16,0,20.9,0,30C0,41,24.1,46,32,46C39.9,46,64,40.5,64,30C63.8,25.7,64,19.8,64,16C64,30,49.2,35,32,35Z')}75%{d:path('M32,55C14.8,55,0,41,0,23.2C0,23.2,0,23.2,0,23.2C0,42,16,55,32,55C51,55,64,38.9,64,23C63.8,18.7,64,26.8,64,23C64,40.6,49.2,55,32,55Z')}76.5625%{d:path('M32,-9C14.8,-9,0,4.5,0,23C0,23,0,13.9,0,23C0,7.2,12.5,-9,32,-9C51.5,-9,64,7.3,64,23C63.8,18.7,64,26.8,64,23C64,5,49.2,-9,32,-9Z')}}@keyframes contentStudioLogoRed1_o{0%,60.9375%,85.9375%,to{opacity:1}75%{opacity:0}}
            @keyframes contentStudioLogoRed1_d{
              0%,to{d:path('M32,0C14.8,0,0,7.3,0,16C0,16,0,20.9,0,30C0,14.2,23.3,11.1,31.2,11.1C39.1,11.1,64,14.3,64,30C63.8,25.7,64,19.8,64,16C64,7.19996,49.2,0,32,0Z')}26.5625%{d:path('M32,16C14.8,16,10.5,16,0,16C0,16,0,20.9,0,30C11,30,24.1,30,32,30C39.9,30,53.5,30,64,30C63.8,25.7,64,19.8,64,16C54.5,16,49.2,16,32,16Z')}50%{d:path('M32,35C14.8,35,0,30,0,16C0,16,0,20.9,0,30C0,41,24.1,46,32,46C39.9,46,64,40.5,64,30C63.8,25.7,64,19.8,64,16C64,30,49.2,35,32,35Z')}75%{d:path('M32,55.2764C14.8,55.2764,-0.117655,40.6867,-0.117655,22.9864C-0.117655,22.9864,-0.0144828,23.007,-0.0144828,23.007C-0.0144828,40.5402,14.5898,55.0607,32,55.0607C51.54,55.0607,63.9954,37.9296,63.9954,22.9491C63.9656,22.9854,64.0751,22.9592,64.0922,22.9762C64.0922,40.3408,49.5282,55.2764,32,55.2764Z')}76.5625%{d:path('M32.0038,-8.99676C14.8038,-8.99676,0.00341815,4.58518,0.00341815,23.0071C0.00341815,23.0071,-0.300638,23.0141,-0.300638,23.0141C-0.300638,6.81093,12.343,-9.24781,32,-9.24781C51.0138,-9.24781,64.2653,6.47886,64.2653,23.0071C64.2653,23.0071,64.0076,23.0181,64.0001,23.0106C64.0001,5.99807,50.2124,-8.99676,32.0038,-8.99676Z')}}
            `}
          </style>
          <path
            id="contentStudioLogoRed2"
            d="M31.8-.2C14.6-.2-.2 5.3-.2 14v14c0-15.8 24.1-17 32-17 8 0 32 1.3 32 17V14C63.8 5.2 49-.2 31.8-.2z"
            fill="#95a3b9"
            transform="rotate(135 29.6 26.5)"
            style={{
              animation:
                'contentStudioLogoRed2_o 2s linear infinite both,contentStudioLogoRed2_d 2s linear infinite both'
            }}
          />
          <path
            id="contentStudioLogoBlue1"
            d="M32-.3C14.6-.3-.2 7.3-.2 16v14c0-15.8 24-19 32-19 7.9 0 32 5 32 19V16c0-8.7-14.8-16.3-32-16.3z"
            fill="#66758d"
            transform="rotate(45 21.2 27.7)"
            style={{
              animation:
                'contentStudioLogoBlue1_o 2s linear infinite both,contentStudioLogoBlue1_d 2s linear infinite both'
            }}
          />
          <path
            id="contentStudioLogoBlue2"
            d="M32 0C14.8 0 0 7.3 0 16v14c0-15.8 23.3-18.9 31.2-18.9C39.1 11.1 64 14.3 64 30c-.2-4.3 0-10.2 0-14C64 7.2 49.2 0 32 0z"
            fill="#3c4758"
            transform="rotate(-135 33.9 27.5)"
            style={{
              animation:
                'contentStudioLogoBlue2_o 2s linear infinite both,contentStudioLogoBlue2_d 2s linear infinite both'
            }}
          />
          <path
            id="contentStudioLogoRed1"
            d="M32 0C14.8 0 0 7.3 0 16v14c0-15.8 23.3-18.9 31.2-18.9C39.1 11.1 64 14.3 64 30c-.2-4.3 0-10.2 0-14C64 7.2 49.2 0 32 0z"
            fill="#fff"
            transform="rotate(-45 42.9 27.5)"
            style={{
              animation:
                'contentStudioLogoRed1_o 2s linear infinite both,contentStudioLogoRed1_d 2s linear infinite both'
            }}
          />
        </svg>

        <div className="sanity-app-loading-screen__inner">
          <div className="sanity-app-loading-screen__text">{this.props.text}</div>
        </div>
      </div>
    )
  }
}
