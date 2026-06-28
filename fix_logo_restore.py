from PIL import Image

# Re-open the current cropped version and expand the crop back out
# by re-cropping the original master logo
img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
w, h = img.size
print(f"Original: {w}x{h}")

import numpy as np
data = np.array(img)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 200) & (g > 200) & (b > 200)
data[white_mask, 3] = 0

# Crop just the top 78% to remove label text, keep full width
result = Image.fromarray(data)
result = result.crop((0, 0, w, int(h * 0.78)))
result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print(f"Saved: {result.size}")
print("SUCCESS")
