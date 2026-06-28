from PIL import Image, ImageEnhance
import numpy as np

img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
data = np.array(img)

# Remove white background
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 200) & (g > 200) & (b > 200)
data[white_mask, 3] = 0

# Crop label text
img = Image.fromarray(data)
w, h = img.size
img = img.crop((0, 0, w, int(h * 0.78)))

# Split channels
r, g, b, a = img.split()
rgb = Image.merge('RGB', (r, g, b))

# Very strong brightness + contrast boost
rgb = ImageEnhance.Brightness(rgb).enhance(3.0)
rgb = ImageEnhance.Contrast(rgb).enhance(1.8)
rgb = ImageEnhance.Color(rgb).enhance(1.5)

result = Image.merge('RGBA', (*rgb.split(), a))
result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("SUCCESS")
