use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;

#[wasm_bindgen]
pub struct QuantumWormholeEngine {
    width: u32,
    height: u32,
}

struct Palette {
    core_glow: (f32, f32, f32),
    photon_ring: (f32, f32, f32),
    accretion_hot: (f32, f32, f32),
    accretion_cool: (f32, f32, f32),
    bg_space: (f32, f32, f32),
}

struct WormholeParams {
    event_horizon: f32,
    lensing_mass: f32,
    swirl_speed: f32,
    spin_dir: f32,
    disk_tilt: f32,
    doppler_intensity: f32,
    turbulence: f32,
    noise_seed: u32,
    palette: Palette,
}

fn derive_params(name: &str, dob: &str) -> WormholeParams {
    let mut hasher = Sha256::new();
    hasher.update(name.as_bytes());
    hasher.update(b":QUANTUM_WORMHOLE:");
    hasher.update(dob.as_bytes());
    let hash_result = hasher.finalize();

    let mut seed_bytes = [0u8; 32];
    seed_bytes.copy_from_slice(&hash_result);
    let mut rng = ChaCha8Rng::from_seed(seed_bytes);

    let event_horizon = rng.gen_range(0.18..0.27);
    let lensing_mass = rng.gen_range(0.35..0.65);
    let swirl_speed = rng.gen_range(0.8..2.2);
    let spin_dir = if rng.gen_bool(0.5) { 1.0 } else { -1.0 };
    let disk_tilt = rng.gen_range(0.3..0.7);
    let doppler_intensity = rng.gen_range(0.4..0.95);
    let turbulence = rng.gen_range(1.2..3.5);
    let noise_seed = rng.gen::<u32>();

    // Select theme colors based on hash entropy
    let color_scheme: u8 = rng.gen_range(0..5);
    let palette = match color_scheme {
        0 => Palette { // Quantum Cyan & Cosmic Purple
            core_glow: (0.1, 0.95, 1.0),
            photon_ring: (0.9, 0.98, 1.0),
            accretion_hot: (0.0, 0.8, 1.0),
            accretion_cool: (0.5, 0.1, 0.95),
            bg_space: (0.02, 0.01, 0.06),
        },
        1 => Palette { // Solar Plasma & Golden Horizon
            core_glow: (1.0, 0.6, 0.1),
            photon_ring: (1.0, 0.95, 0.7),
            accretion_hot: (1.0, 0.4, 0.05),
            accretion_cool: (0.8, 0.05, 0.3),
            bg_space: (0.04, 0.01, 0.02),
        },
        2 => Palette { // Emerald Nebula & Void Green
            core_glow: (0.2, 1.0, 0.6),
            photon_ring: (0.8, 1.0, 0.85),
            accretion_hot: (0.05, 0.9, 0.5),
            accretion_cool: (0.0, 0.4, 0.7),
            bg_space: (0.01, 0.03, 0.03),
        },
        3 => Palette { // Neon Violet & Electric Magenta
            core_glow: (0.95, 0.2, 1.0),
            photon_ring: (1.0, 0.85, 1.0),
            accretion_hot: (0.85, 0.05, 0.9),
            accretion_cool: (0.2, 0.1, 0.8),
            bg_space: (0.03, 0.01, 0.05),
        },
        _ => Palette { // Singularity Gold & Deep Sapphire
            core_glow: (0.3, 0.7, 1.0),
            photon_ring: (1.0, 0.9, 0.6),
            accretion_hot: (1.0, 0.7, 0.2),
            accretion_cool: (0.1, 0.2, 0.7),
            bg_space: (0.01, 0.01, 0.04),
        },
    };

    WormholeParams {
        event_horizon,
        lensing_mass,
        swirl_speed,
        spin_dir,
        disk_tilt,
        doppler_intensity,
        turbulence,
        noise_seed,
        palette,
    }
}

// Simple procedural noise for accretion disk plasma texture
fn hash_2d(x: f32, y: f32, seed: u32) -> f32 {
    let u = (x * 12.9898 + y * 78.233 + (seed as f32) * 0.01).sin() * 43758.5453;
    u.fract().abs()
}

fn smooth_noise(x: f32, y: f32, seed: u32) -> f32 {
    let ix = x.floor();
    let iy = y.floor();
    let fx = x - ix;
    let fy = y - iy;

    let sx = fx * fx * (3.0 - 2.0 * fx);
    let sy = fy * fy * (3.0 - 2.0 * fy);

    let n00 = hash_2d(ix, iy, seed);
    let n10 = hash_2d(ix + 1.0, iy, seed);
    let n01 = hash_2d(ix, iy + 1.0, seed);
    let n11 = hash_2d(ix + 1.0, iy + 1.0, seed);

    let nx0 = n00 + sx * (n10 - n00);
    let nx1 = n01 + sx * (n11 - n01);

    nx0 + sy * (nx1 - nx0)
}

fn fbm(x: f32, y: f32, octaves: u32, seed: u32) -> f32 {
    let mut val = 0.0;
    let mut amp = 0.5;
    let mut freq = 1.0;
    for i in 0..octaves {
        val += amp * smooth_noise(x * freq, y * freq, seed + i * 100);
        freq *= 2.05;
        amp *= 0.5;
    }
    val
}

#[wasm_bindgen]
impl QuantumWormholeEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> QuantumWormholeEngine {
        QuantumWormholeEngine { width, height }
    }

    /// Generates RGBA pixel buffer (size width * height * 4)
    pub fn render(
        &self,
        name: &str,
        dob: &str,
        time: f64,
        warp_intensity: f32,
        quantum_flux: f32,
    ) -> Vec<u8> {
        let params = derive_params(name, dob);
        let w = self.width as usize;
        let h = self.height as usize;
        let mut buffer = vec![0u8; w * h * 4];

        let aspect = (w as f32) / (h as f32);
        let inv_w = 2.0 / (w as f32);
        let inv_h = 2.0 / (h as f32);

        let t = (time as f32) * params.swirl_speed * params.spin_dir * 0.5;
        let r_event = params.event_horizon;
        let r_photon = r_event * 1.15;
        let mass = params.lensing_mass * warp_intensity;

        for y in 0..h {
            let py = 1.0 - (y as f32) * inv_h; // [-1, 1]
            for x in 0..w {
                let px = ((x as f32) * inv_w - 1.0) * aspect; // [-1, 1]

                // Radial distance from center singularity
                let raw_r = (px * px + py * py).sqrt();
                let angle = py.atan2(px);

                // Gravitational lensing ray deflection
                // Near event horizon, light rays bend inwards dramatically
                let bent_r = if raw_r < r_event {
                    0.0
                } else {
                    let deflection = mass / ((raw_r - r_event).max(0.01));
                    raw_r - (deflection * 0.08).min(raw_r * 0.7)
                };

                let mut r = 0.0f32;
                let mut g = 0.0f32;
                let mut b = 0.0f32;

                if bent_r <= r_event * 0.98 {
                    // Inside Black Hole Event Horizon - Pitch Void with subtle quantum singularity glow
                    let void_glow = (1.0 - bent_r / r_event).powf(4.0) * 0.15 * quantum_flux;
                    r = params.palette.core_glow.0 * void_glow;
                    g = params.palette.core_glow.1 * void_glow;
                    b = params.palette.core_glow.2 * void_glow;
                } else {
                    // 1. Photon Ring (Razor-sharp intense gravitational light ring)
                    let dist_photon = (bent_r - r_photon).abs();
                    let photon_glow = (-dist_photon * 45.0).exp() * 2.2;
                    
                    r += params.palette.photon_ring.0 * photon_glow;
                    g += params.palette.photon_ring.1 * photon_glow;
                    b += params.palette.photon_ring.2 * photon_glow;

                    // 2. Accretion Disk Physics Simulation (tilted 3D plane projection)
                    let py_tilted = py / params.disk_tilt;
                    let r_disk = (px * px + py_tilted * py_tilted).sqrt();
                    let disk_angle = py_tilted.atan2(px) + t * 0.8 + (1.0 / (r_disk + 0.05)) * 0.5;

                    let disk_inner = r_event * 1.1;
                    let disk_outer = r_event * 3.4;

                    if r_disk > disk_inner && r_disk < disk_outer {
                        // Radial intensity profile
                        let norm_disk_r = (r_disk - disk_inner) / (disk_outer - disk_inner);
                        let disk_falloff = (1.0 - norm_disk_r).powf(1.5) * (norm_disk_r * 4.0).min(1.0);

                        // Procedural plasma turbulence
                        let noise_u = disk_angle * params.turbulence;
                        let noise_v = r_disk * 8.0 - t * 1.5;
                        let plasma_noise = fbm(noise_u, noise_v, 4, params.noise_seed);

                        // Relativistic Doppler Beaming (approaching side is brighter & bluer, receding dimmer)
                        let doppler = 1.0 + params.doppler_intensity * disk_angle.cos();
                        let intensity = disk_falloff * (0.4 + plasma_noise * 1.2) * doppler;

                        // Color interpolation across accretion disk temperature gradient
                        let mix_factor = (plasma_noise + norm_disk_r).clamp(0.0, 1.0);
                        let disk_r = params.palette.accretion_hot.0 * (1.0 - mix_factor) + params.palette.accretion_cool.0 * mix_factor;
                        let disk_g = params.palette.accretion_hot.1 * (1.0 - mix_factor) + params.palette.accretion_cool.1 * mix_factor;
                        let disk_b = params.palette.accretion_hot.2 * (1.0 - mix_factor) + params.palette.accretion_cool.2 * mix_factor;

                        r += disk_r * intensity;
                        g += disk_g * intensity;
                        b += disk_b * intensity;
                    }

                    // 3. Spacetime Warp Gravitational Halo & Background Einstein Distortion
                    let halo_intensity = (-bent_r * 2.2).exp() * 0.8;
                    r += params.palette.core_glow.0 * halo_intensity;
                    g += params.palette.core_glow.1 * halo_intensity;
                    b += params.palette.core_glow.2 * halo_intensity;

                    // 4. Distorted Background Starfield & Quantum Fluctuations
                    let star_angle = angle + (0.3 / (raw_r + 0.1));
                    let star_grid_x = (star_angle * 12.0).cos() * raw_r * 20.0;
                    let star_grid_y = (star_angle * 12.0).sin() * raw_r * 20.0;
                    let star_n = hash_2d(star_grid_x.floor(), star_grid_y.floor(), params.noise_seed + 999);
                    
                    if star_n > 0.94 {
                        let star_twinkle = ((t * 4.0 + star_n * 100.0).sin() * 0.5 + 0.5) * (raw_r * 1.5).min(1.0);
                        r += star_twinkle * 0.9;
                        g += star_twinkle * 0.95;
                        b += star_twinkle * 1.0;
                    }

                    // Base deep space tint
                    r += params.palette.bg_space.0;
                    g += params.palette.bg_space.1;
                    b += params.palette.bg_space.2;
                }

                // Tone mapping & Gamma Correction (HDR to LDR)
                let tone = |c: f32| -> u8 {
                    let mapped = c / (1.0 + c); // Reinhard tone mapping
                    let gamma_corrected = mapped.powf(1.0 / 2.2);
                    (gamma_corrected.clamp(0.0, 1.0) * 255.0) as u8
                };

                let idx = (y * w + x) * 4;
                buffer[idx] = tone(r);
                buffer[idx + 1] = tone(g);
                buffer[idx + 2] = tone(b);
                buffer[idx + 3] = 255;
            }
        }

        buffer
    }
}
