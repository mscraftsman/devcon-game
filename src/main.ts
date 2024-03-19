import './style.css'
import { setupGame } from './game.ts'

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="wrapper">
    <h1 class="font-bold text-2xl text-white text-center">Dodo Run</h1>
    <canvas id="game"></canvas>
  </div>
`;

setupGame(document.querySelector<HTMLCanvasElement>('#game')!)
