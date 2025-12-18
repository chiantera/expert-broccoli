import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeContext {
  readonly scene: Scene;
  readonly renderer: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  private controls: OrbitControls;
  private animationFrame: number | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new Scene();
    this.scene.background = new Color('#0c1118');
    this.camera = new PerspectiveCamera(45, 1, 0.01, 1000);
    this.camera.position.set(0, 0, 20);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0, 0);

    this.addDefaultLights();

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  start() {
    const loop = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }

  private addDefaultLights() {
    const ambient = new AmbientLight('#c8d8ff', 0.35);
    const key = new DirectionalLight('#e8f1ff', 1.0);
    key.position.set(4, 6, 10);
    const rim = new DirectionalLight('#6de0ff', 0.5);
    rim.position.set(-6, -4, -8);
    this.scene.add(ambient, key, rim);
  }

  private handleResize = () => {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / Math.max(1, clientHeight);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };
}
