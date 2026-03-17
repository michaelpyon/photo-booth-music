/**
 * WelcomePopup — first-visit onboarding overlay.
 *
 * Shows once per device (localStorage flag). Explains the Listen feature
 * with an inline SVG tutorial graphic. Dismisses on "Let's Jam!" click.
 */
export class WelcomePopup {
  private el: HTMLDivElement;
  private onDismiss?: () => void;

  constructor(onDismiss?: () => void) {
    this.onDismiss = onDismiss;
    this.el = document.createElement('div');
    this.el.id = 'welcome-popup';
    this.el.innerHTML = `
      <div class="welcome-backdrop"></div>
      <div class="welcome-card">
        <div class="welcome-badge">EXPERIMENTAL</div>
        <h1 class="welcome-title">Welcome to Air Composer!</h1>
        <p class="welcome-subtitle">Play music with your hands in the air.</p>

        <div class="welcome-tutorial">
          <div class="tutorial-step">
            <div class="tutorial-graphic">
              ${this.handSvg()}
            </div>
            <div class="tutorial-text">
              <span class="tutorial-label">Move your hand</span>
              <span class="tutorial-desc">Raise your hand in front of the camera to play notes. Left/right controls pitch, up/down controls volume.</span>
            </div>
          </div>

          <div class="tutorial-divider"></div>

          <div class="tutorial-step">
            <div class="tutorial-graphic">
              ${this.listenSvg()}
            </div>
            <div class="tutorial-text">
              <span class="tutorial-label">Favorite song? Tap Listen</span>
              <span class="tutorial-desc">Play your song next to your speaker and Air Composer will match the key and scale so you can play along.</span>
            </div>
          </div>
        </div>

        <button class="welcome-btn" id="welcome-dismiss">🎸 Let's Jam!</button>
      </div>
    `;

    document.body.appendChild(this.el);

    // Animate in
    requestAnimationFrame(() => {
      this.el.classList.add('visible');
    });

    this.el.querySelector('#welcome-dismiss')!.addEventListener('click', () => {
      this.dismiss();
    });
  }

  private handSvg(): string {
    // Hand with index finger pointing, with musical notes nearby
    return `
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="tutorial-svg">
        <!-- Hand silhouette -->
        <g opacity="0.9">
          <!-- Palm -->
          <rect x="35" y="45" width="30" height="35" rx="6" fill="#333" stroke="#0ff" stroke-width="1.5"/>
          <!-- Index finger (pointing up) -->
          <rect x="39" y="12" width="10" height="38" rx="5" fill="#333" stroke="#0ff" stroke-width="1.5"/>
          <!-- Middle finger (curled) -->
          <rect x="51" y="30" width="9" height="20" rx="4.5" fill="#333" stroke="#555" stroke-width="1"/>
          <!-- Ring finger (curled) -->
          <rect x="44" y="72" width="8" height="12" rx="4" fill="#333" stroke="#555" stroke-width="1"/>
          <!-- Thumb connector (fills gap between thumb and palm) -->
          <rect x="33" y="47" width="6" height="11" fill="#333"/>
          <!-- Thumb -->
          <rect x="20" y="47" width="18" height="11" rx="4.5" fill="#333" stroke="#555" stroke-width="1"/>
          <!-- Fingertip glow -->
          <circle cx="44" cy="12" r="8" fill="none" stroke="#0ff" stroke-width="0.8" opacity="0.5">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="44" cy="12" r="3" fill="#0ff" opacity="0.8"/>
        </g>
        <!-- Musical notes floating -->
        <g fill="#0ff" opacity="0.6">
          <text x="72" y="22" font-size="16" font-family="serif">♪</text>
          <text x="85" y="38" font-size="12" font-family="serif" opacity="0.4">♫</text>
          <text x="78" y="52" font-size="10" font-family="serif" opacity="0.3">♩</text>
        </g>
        <!-- Motion lines -->
        <g stroke="#0ff" stroke-width="0.8" opacity="0.3">
          <line x1="30" y1="20" x2="20" y2="15">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.5s" repeatCount="indefinite"/>
          </line>
          <line x1="28" y1="28" x2="16" y2="26">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
          </line>
        </g>
      </svg>
    `;
  }

  private listenSvg(): string {
    // Speaker with sound waves + phone with "Listen" button
    return `
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="tutorial-svg">
        <!-- Speaker -->
        <g opacity="0.9">
          <rect x="10" y="30" width="28" height="40" rx="4" fill="#333" stroke="#555" stroke-width="1.5"/>
          <circle cx="24" cy="50" r="10" fill="none" stroke="#555" stroke-width="1.5"/>
          <circle cx="24" cy="50" r="4" fill="#555"/>
          <!-- Sound waves -->
          <path d="M42 40 Q50 50 42 60" stroke="#ff3344" stroke-width="1.5" fill="none" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.2s" repeatCount="indefinite"/>
          </path>
          <path d="M48 34 Q58 50 48 66" stroke="#ff3344" stroke-width="1.2" fill="none" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.2s" begin="0.2s" repeatCount="indefinite"/>
          </path>
          <path d="M54 28 Q66 50 54 72" stroke="#ff3344" stroke-width="1" fill="none" opacity="0.2">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.2s" begin="0.4s" repeatCount="indefinite"/>
          </path>
        </g>
        <!-- Arrow -->
        <g stroke="#888" stroke-width="1" opacity="0.5">
          <line x1="64" y1="50" x2="74" y2="50"/>
          <polyline points="72,47 75,50 72,53"/>
        </g>
        <!-- Phone with Listen button -->
        <g>
          <rect x="78" y="25" width="30" height="50" rx="5" fill="#222" stroke="#666" stroke-width="1.5"/>
          <!-- Screen -->
          <rect x="82" y="32" width="22" height="36" rx="2" fill="#111"/>
          <!-- Listen button on screen -->
          <rect x="84" y="44" width="18" height="10" rx="3" fill="#ff3344" opacity="0.8">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </rect>
          <text x="87" y="52" font-size="5" fill="#fff" font-family="monospace" font-weight="bold">LISTEN</text>
          <!-- Key detected -->
          <text x="85" y="62" font-size="4.5" fill="#ffc864" font-family="monospace">C Major</text>
        </g>
      </svg>
    `;
  }

  private dismiss(): void {
    localStorage.setItem('air-composer-welcomed', '1');
    this.el.classList.remove('visible');
    this.el.classList.add('dismissing');
    setTimeout(() => {
      this.el.remove();
      this.onDismiss?.();
    }, 400);
  }

  static shouldShow(): boolean {
    return localStorage.getItem('air-composer-welcomed') !== '1';
  }
}
