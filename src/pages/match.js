import * as React from "react"
import Helmet from "react-helmet"
import { withPrefix, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as playerStyle from "./match.module.scss"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faPause, faVolumeLow, faVolumeHigh, faVolumeXmark, faVolumeOff, faExpand, faCompress } from "@fortawesome/free-solid-svg-icons"

export const Module = {}

const match = "weeklies/ctf_blue_vs_red[ctf8]220410-2048"

class FteComponent extends React.Component {
  state = {
    demo: null,
    refreshInterval: null,
    gametime: 0,
    playing: true,
    playbackSpeed: 100,
    volume: Math.sqrt(0.05),
    volumeMuted: false,
    volumeHover: false,
    volumeIcon: faVolumeLow,
    playerControlTimeout: 0,
    firstRefresh: true,
  }

  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
    this.playerRef = React.createRef()
    this.playing = true
    this.playbackSpeed = 100
  }

  componentDidMount() {
    const baseUrl = "https://media.githubusercontent.com/media/qw-ctf/matches/main/weeklies/"
    window.Module = {
      canvas: this.canvasRef.current,
      files: {
        "default.fmf": withPrefix("/data/default.fmf"),
        "id1/config.cfg": withPrefix("/data/id1/config.cfg"),
        "id1/id1_bmodels.pk3": withPrefix("/data/id1/id1_bmodels.pk3"),
        "id1/id1_skins.pk3": withPrefix("/data/id1/id1_skins.pk3"),
        "id1/id1_progs.pk3": withPrefix("/data/id1/id1_progs.pk3"),
        "id1/qw_progs.pk3": withPrefix("/data/id1/qw_progs.pk3"),
        "id1/gfx.pk3": withPrefix("/data/id1/gfx.pk3"),
        "id1/sound.pk3": withPrefix("/data/id1/sound.pk3"),
        "id1/textures.pk3": withPrefix("/data/id1/textures.pk3"),
        "id1/plaguespack_fte.pk3": withPrefix("/data/id1/plaguespack_fte.pk3"),
        "id1/maps/ctf2m1.bsp": withPrefix("/data/id1/maps/ctf2m1.bsp"),
        "id1/maps/ctf2m1.lit": withPrefix("/data/id1/maps/ctf2m1.lit"),
        "id1/maps/ctf8.bsp": withPrefix("/data/id1/maps/ctf8.bsp"),
        "id1/maps/ctf8.lit": withPrefix("/data/id1/maps/ctf8.lit"),
        "id1/maps/ctf5.bsp": withPrefix("/data/id1/maps/ctf5.bsp"),
        "id1/maps/ctf5.lit": withPrefix("/data/id1/maps/ctf5.lit"),
        "id1/maps/e2m2.bsp": withPrefix("/data/id1/maps/e2m2.bsp"),
        "id1/maps/e1m1.bsp": withPrefix("/data/id1/maps/e1m1.bsp"),
        "id1/maps/e1m1.lit": withPrefix("/data/id1/maps/e1m1.lit"),
        "id1/maps/pound.bsp": withPrefix("/data/id1/maps/pound.bsp"),
        "id1/maps/softbox.bsp": withPrefix("/data/id1/maps/softbox.bsp"),
        "id1/textures/#04water1.png": withPrefix("/data/tex/water.png"),
        "id1/textures/rock4_2.png": withPrefix("/data/tex/rock4_2.png"),
        "id1/textures/sky1.png": withPrefix("/data/tex/sky1.png"),
        "id1/textures/sky4.png": withPrefix("/data/tex/sky4.png"),
        "id1/textures/wall14_5.png": withPrefix("/data/tex/wall14_5.png"),
        "id1/textures/#water1.png": withPrefix("/data/tex/#water1.png"),
        "id1/textures/wbrick1_5.png": withPrefix("/data/tex/wbrick1_5.png"),
        "id1/textures/wexit01.png": withPrefix("/data/tex/wexit01.png"),
        "id1/textures/wgrnd1_6.png": withPrefix("/data/tex/wgrnd1_6.png"),
        "id1/textures/wiz1_4.png": withPrefix("/data/tex/wiz1_4.png"),
        "id1/textures/wizmet1_6.png": withPrefix("/data/tex/wizmet1_6.png"),
        "id1/textures/wswamp1_2.png": withPrefix("/data/tex/wswamp1_2.png"),
        "id1/textures/wwood1_5.png": withPrefix("/data/tex/wwood1_5.png"),
        "id1/gfx/ranking.png": withPrefix("/data/tex/ranking.png"),
        "qw/fragfile.dat": withPrefix("/data/fragfile.dat"),
        "qw/match.mvd.gz": `${baseUrl}${encodeURIComponent(this.props.demo)}.gz`,
      },
    }

    const fteScript = document.createElement("script")
    fteScript.src = withPrefix("/ftewebgl.js")

    document.head.appendChild(fteScript)

    document.onfullscreenchange = e => {
      const conWidth = (this.playerRef.current.clientWidth / 4) * window.devicePixelRatio
      window.onresize()
      window.Module.execute("vid_conwidth " + conWidth.toString())
    }

    setInterval(this.onFteRefresh.bind(this), 250)
  }

  onFteRefresh() {
    if (window.Module.gametime) {
      this.setState({ gametime: window.Module.gametime() })
    }
    if (this.state.playerControlTimeout != 0 && this.state.playerControlTimeout < Date.now()) {
      this.setState({ playerControlTimeout: 0 })
    }
    if (this.state.firstRefresh && this.state.gametime > 0) {
      if (this.props.initialPlayer) {
        window.Module.execute("cl_autotrack off")
        window.Module.execute("autotrack off")
        window.Module.execute("track " + this.props.initialPlayer) // cmd: users for userId
      }
      if (this.props.initialSpeed) {
        window.Module.execute("demo_setspeed " + this.props.initialSpeed)
      }
      if (this.props.initialPosition) {
        window.Module.execute("demo_jump " + this.props.initialPosition)
      }
      this.setState({ firstRefresh: false })
    }

    if (this.props.loop && this.state.gametime >= this.props.initialPosition + this.props.loop) {
      window.Module.execute("demo_jump " + this.props.initialPosition)
    }

    // This is a hack, seeking causes player to switch
    if (this.state.gametime > 0 && this.props.initialPlayer) {
      window.Module.execute("track " + this.props.initialPlayer) // cmd: users for userId
    }
  }

  onCanvasClick(event) {
    switch (event.detail) {
      case 1:
        this.togglePlay()
        break
      case 2:
        this.toggleFullscreen()
        break
    }
  }

  togglePlay() {
    if (this.state.playing) {
      window.Module.execute("demo_setspeed 0")
      this.setState({ playing: false })
    } else {
      window.Module.execute("demo_setspeed " + this.playbackSpeed)
      this.setState({ playing: true })
    }
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.fullscreenElement = this.playerRef.current
      this.playerRef.current.width = window.screen.width / window.devicePixelRatio
      this.playerRef.current.height = window.screen.height / window.devicePixelRatio
      this.playerRef.current.requestFullscreen()
      window.onresize()
    }
  }

  toggleMuted() {
    if (this.state.volumeMuted) {
      this.setState({ volumeMuted: false })
      const volume = this.state.volume * this.state.volume
      window.Module.execute("volume " + volume)
    } else {
      this.setState({ volumeMuted: true })
      window.Module.execute("volume 0")
    }
  }

  onVolumeChange(e) {
    const volume = this.state.volume * this.state.volume
    window.Module.execute("volume " + volume)
    this.setState({ volume: e.target.value })
    if (e.target.value == 0) {
      this.setState({ volumeIcon: faVolumeOff })
    } else if (e.target.value < 0.5) {
      this.setState({ volumeIcon: faVolumeLow })
    } else {
      this.setState({ volumeIcon: faVolumeHigh })
    }
  }

  onMouseMove() {
    this.setState({ playerControlTimeout: Date.now() + 3000 })
  }

  onMouseOut() {
    this.setState({ playerControlTimeout: 0 })
  }

  onTouchStart() {
    window.Module.execute("+showteamscores")
  }

  onTouchEnd() {
    window.Module.execute("-showteamscores")
  }

  onDemoSeek(event) {
    const offset = Math.floor((event.clientX / event.target.offsetParent.offsetWidth) * (600 + 10))
    console.log(offset, event.clientX, event.target.offsetWidth, event)
    window.Module.execute("demo_jump " + offset)
  }

  render() {
    const gametimeMinutes = Math.floor(this.state.gametime / 60).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })
    const gametimeSeconds = Math.floor(this.state.gametime % 60).toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })
    const gametimeProgress = ((this.state.gametime / 600.0) * 100.0).toString() + "%"
    return (
      <div ref={this.playerRef} onMouseMove={this.onMouseMove.bind(this)} onMouseOut={this.onMouseOut.bind(this)} className={playerStyle.videoPlayer}>
        <canvas
          id="canvas"
          ref={this.canvasRef}
          className={playerStyle.emscripten}
          onClick={this.onCanvasClick.bind(this)}
          onTouchStart={this.onTouchStart.bind(this)}
          onTouchEnd={this.onTouchEnd.bind(this)}
          style={{
            cursor: this.state.playerControlTimeout ? "auto" : "none",
          }}
        />
        <div className={this.state.playerControlTimeout ? playerStyle.playerControlsShow : playerStyle.playerControls}>
          <div className={playerStyle.videoProgress} onClick={this.onDemoSeek.bind(this)}>
            <div className={playerStyle.videoProgressFilled} style={{ width: gametimeProgress }}></div>
          </div>
          <button className={playerStyle.playButton} title="Play" onClick={this.togglePlay.bind(this)}>
            <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} />
          </button>
          <button className={playerStyle.volumeButton} title="Volume" onClick={this.toggleMuted.bind(this)}>
            <FontAwesomeIcon icon={this.state.volumeMuted ? faVolumeXmark : this.state.volumeIcon} />
          </button>
          <input
            type="range"
            className={playerStyle.volumeRange}
            min="0"
            max="1"
            step="0.01"
            value={this.state.volume}
            disabled={this.state.volumeMuted}
            onChange={this.onVolumeChange.bind(this)}
          />
          <div className={playerStyle.time}>
            <span id="demotime">
              {gametimeMinutes}:{gametimeSeconds} / 10:00
            </span>
          </div>
          <button className={playerStyle.fullscreenButton} onClick={this.toggleFullscreen.bind(this)} style={{ color: "white" }}>
            <FontAwesomeIcon icon={faExpand} />
          </button>
        </div>
      </div>
    )
  }
}

const SecondPage = ({ pageContext: { demo, map } }) => {
  //const parts = window.location.hash.substring(1).split("&")
  let loop = null
  let initialSpeed = null
  let initialPlayer = null
  let initialPosition = null
  /*
  for (let i = 0; i < parts.length; i++) {
    const kv = parts[i].split("=")
    if (kv.length != 2) continue
    switch (kv[0]) {
      case "player":
        initialPlayer = Number.parseInt(kv[1])
        break
      case "speed":
        initialSpeed = Number.parseInt(kv[1])
        break
      case "position":
        initialPosition = Number.parseInt(kv[1])
        break
      case "loop":
        loop = Number.parseInt(kv[1])
        break
    }
  }
  */

  return (
    <Layout>
      <Seo title="demo" />
      <FteComponent demo={demo} map={map} initialPlayer={initialPlayer} initialSpeed={initialSpeed} initialPosition={initialPosition} loop={loop} />
    </Layout>
  )
}

export default SecondPage
