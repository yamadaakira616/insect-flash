import { useId } from 'react';

/**
 * @param {Object} props
 * @param {'grassland'|'forest'|'night'} props.scene
 * @param {number} [props.height=120]
 */
export default function WorldScene({ scene, height = 120 }) {
  const uid = useId();

  if (scene === 'grassland') return (
    <svg width="100%" height={height} viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {/* 空 */}
      <rect width="400" height="120" fill="#bef264"/>
      {/* 太陽 */}
      <circle cx="350" cy="30" r="22" fill="#fbbf24"/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a} x1={350+22*Math.cos(a*Math.PI/180)} y1={30+22*Math.sin(a*Math.PI/180)}
          x2={350+34*Math.cos(a*Math.PI/180)} y2={30+34*Math.sin(a*Math.PI/180)}
          stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      ))}
      {/* 地面 */}
      <ellipse cx="200" cy="110" rx="220" ry="25" fill="#4ade80"/>
      {/* 草 */}
      {[30,70,120,180,240,300,350].map(x => (
        <g key={x}>
          <line x1={x} y1="100" x2={x-5} y2="82" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
          <line x1={x} y1="100" x2={x} y2="78" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
          <line x1={x} y1="100" x2={x+5} y2="82" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
        </g>
      ))}
      {/* 花 */}
      {[50,150,260,330].map((x,i) => (
        <g key={x}>
          <circle cx={x} cy={85} r="6" fill={['#f87171','#fb923c','#fbbf24','#a78bfa'][i]}/>
          <circle cx={x} cy={73} r="4" fill="white"/>
        </g>
      ))}
    </svg>
  );

  if (scene === 'forest') return (
    <svg width="100%" height={height} viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {/* 空（夕暮れ） */}
      <defs>
        <linearGradient id={`${uid}-forestSky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#065f46"/>
          <stop offset="100%" stopColor="#14532d"/>
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#${uid}-forestSky)`}/>
      {/* 木々 */}
      {[30,90,160,230,300,370].map((x,i) => (
        <g key={x}>
          <rect x={x-5} y={60+i%2*10} width="10" height="60" fill="#92400e"/>
          <polygon points={`${x},${10+i%3*8} ${x-25},${65+i%2*10} ${x+25},${65+i%2*10}`} fill="#166534"/>
          <polygon points={`${x},${-5+i%3*8} ${x-18},${35+i%2*10} ${x+18},${35+i%2*10}`} fill="#15803d"/>
        </g>
      ))}
      {/* 地面 */}
      <rect x="0" y="100" width="400" height="20" fill="#064e3b"/>
      {/* 葉 */}
      {[60,140,220,300].map(x => (
        <ellipse key={x} cx={x} cy={108} rx="15" ry="8" fill="#065f46"/>
      ))}
    </svg>
  );

  // night
  return (
    <svg width="100%" height={height} viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}-nightSky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0c29"/>
          <stop offset="100%" stopColor="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#${uid}-nightSky)`}/>
      {/* 月 */}
      <circle cx="340" cy="35" r="20" fill="#fef9c3"/>
      <circle cx="350" cy="28" r="17" fill="#1e1b4b"/>
      {/* 星 */}
      {[20,60,100,150,200,250,290,380,30,360].map((x,i) => (
        <circle key={x} cx={x} cy={[10,25,8,18,30,12,22,15,35,40][i]} r="1.5" fill="white" opacity="0.9"/>
      ))}
      {/* 木シルエット */}
      {[20,80,160,250,330,390].map((x,i) => (
        <g key={x}>
          <rect x={x-4} y={70} width="8" height="50" fill="#0f172a"/>
          <polygon points={`${x},${15+i%2*10} ${x-22},${72} ${x+22},${72}`} fill="#0f172a"/>
        </g>
      ))}
      {/* 地面 */}
      <rect x="0" y="105" width="400" height="15" fill="#0f172a"/>
      {/* ホタル風光点 */}
      {[80,180,280,320].map((x,i) => (
        <circle key={x} cx={x} cy={[85,75,90,80][i]} r="3" fill="#86efac" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur={`${1.5+i*0.4}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}
