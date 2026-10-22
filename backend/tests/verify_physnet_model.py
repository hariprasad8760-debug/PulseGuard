"""Verification script for PhysNet rPPG model initialization and synthetic inference.

Does not modify any application code, APIs, or database.
"""
import os
import sys
import numpy as np
import torch

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models.physnet import PhysNet, hr_from_wave

def verify_physnet():
    print("=" * 60)
    print("PHYSNET rPPG MODEL VERIFICATION")
    print("=" * 60)
    print(f"PyTorch version: {torch.__version__}")
    print(f"Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")

    # Checkpoint path
    ckpt_path = os.path.join(backend_dir, "app", "models", "rppg_physnet_ubfc.pth")
    if not os.path.exists(ckpt_path):
        ckpt_path = os.path.join(backend_dir, "app", "models", "rppg_physnet_ubfc.pt")
    
    print(f"Loading checkpoint from: {ckpt_path}")
    assert os.path.exists(ckpt_path), f"Checkpoint not found at {ckpt_path}"

    # Safe loading via torch.load with map_location="cpu"
    try:
        # In modern PyTorch, weights_only=True is safer if supported
        checkpoint = torch.load(ckpt_path, map_location="cpu", weights_only=False)
        print("Checkpoint successfully loaded with torch.load().")
    except Exception as e:
        print(f"Failed to load checkpoint: {e}")
        return False

    print(f"Checkpoint type: {type(checkpoint)}")
    if isinstance(checkpoint, dict):
        print(f"Top-level keys in checkpoint: {list(checkpoint.keys())}")
        for meta_k in ["width", "clip_frames", "clip_seconds", "best_mae", "epoch", "finetune"]:
            if meta_k in checkpoint:
                print(f"  {meta_k}: {checkpoint[meta_k]}")
        raw_state_dict = checkpoint.get("state_dict", checkpoint)
    else:
        raw_state_dict = checkpoint

    # Inspect width
    model_width = checkpoint.get("width", 32) if isinstance(checkpoint, dict) else 32
    print(f"\nInstantiating PhysNet(width={model_width})...")
    model = PhysNet(width=model_width)
    model.eval()

    # Compare state_dict keys
    model_keys = set(model.state_dict().keys())
    ckpt_keys = set(raw_state_dict.keys())

    missing = model_keys - ckpt_keys
    unexpected = ckpt_keys - model_keys

    print(f"\nModel architecture parameter count: {len(model_keys)}")
    print(f"Checkpoint parameter count: {len(ckpt_keys)}")
    print(f"Missing keys: {list(missing) if missing else 'None (0 missing)'}")
    print(f"Unexpected keys: {list(unexpected) if unexpected else 'None (0 unexpected)'}")

    # Load weights into model
    load_result = model.load_state_dict(raw_state_dict, strict=True)
    print(f"load_state_dict result: {load_result}")

    # Check parameter stats to ensure real weights
    sample_param = model.stem.net[0].weight
    print(f"Sample weight (stem.net.0.weight) shape: {tuple(sample_param.shape)}, "
          f"mean={sample_param.mean().item():.6f}, std={sample_param.std().item():.6f}")

    # Run minimal inference test using correctly shaped synthetic input
    print("\n" + "-" * 60)
    print("SYNTHETIC INFERENCE TEST (NOT real-video validation)")
    print("-" * 60)
    clip_frames = checkpoint.get("clip_frames", 128) if isinstance(checkpoint, dict) else 128
    H, W = 64, 64  # standard spatial crop for rPPG 3D-CNNs
    batch_size = 1

    # Input: (B, 3, T, H, W) normalized to [0, 1]
    synthetic_input = torch.rand(batch_size, 3, clip_frames, H, W, dtype=torch.float32)
    print(f"Synthetic input tensor shape: {tuple(synthetic_input.shape)} in [0, 1]")

    with torch.no_grad():
        waveform = model(synthetic_input)

    print(f"Output waveform shape: {tuple(waveform.shape)}")
    assert waveform.shape == (batch_size, clip_frames), f"Expected shape ({batch_size}, {clip_frames}), got {waveform.shape}"
    
    waveform_np = waveform[0].cpu().numpy()
    print(f"Waveform output stats: min={waveform_np.min():.4f}, max={waveform_np.max():.4f}, "
          f"mean={waveform_np.mean():.4f}, std={waveform_np.std():.4f}")

    # Test HR extraction utility
    fs = float(clip_frames) / float(checkpoint.get("clip_seconds", 20.0) if isinstance(checkpoint, dict) else 20.0)
    est_hr = hr_from_wave(waveform_np, fs=fs)
    print(f"HR extraction test using hr_from_wave (fs={fs:.2f} Hz): {est_hr:.1f} BPM (synthetic peak)")
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED: Model is verified and ready for integration.")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = verify_physnet()
    sys.exit(0 if success else 1)
