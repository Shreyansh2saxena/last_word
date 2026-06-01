import CRTEffects from '../components/atmosphere/CRTEffects.jsx'
import BottomStatusBar from '../components/hud/BottomStatusBar.jsx'
import NewsTicker from '../components/hud/NewsTicker.jsx'

function AppShell({ settings, topTickerItems, bottomBarProps, children }) {
  return (
    <div className="app-shell h-screen overflow-hidden">
      <CRTEffects reducedFlicker={settings.reducedFlicker} />

      <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4">
        <NewsTicker items={topTickerItems} />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <BottomStatusBar {...bottomBarProps} />
      </div>
    </div>
  )
}

export default AppShell
