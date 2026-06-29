from PIL import Image, ImageEnhance
import numpy as np

img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Remove dark navy background
is_dark_navy = (r.astype(int) < 55) & (g.astype(int) < 70) & (b.astype(int) < 100) & (b.astype(int) > r.astype(int))
is_near_black = (r.astype(int) < 30) & (g.astype(int) < 30) & (b.astype(int) < 30)
mask = is_dark_navy | is_near_black
data[:,:,3] = np.where(mask, 0, a)

result = Image.fromarray(data)

# Crop to content
alpha = data[:,:,3]
rows = np.any(alpha > 10, axis=1)
cols = np.any(alpha > 10, axis=0)
rmin, rmax = np.where(rows)[0][[0,-1]]
cmin, cmax = np.where(cols)[0][[0,-1]]
pad = 10
result = result.crop((max(0,cmin-pad), max(0,rmin-pad), min(result.width,cmax+pad), min(result.height,rmax+pad)))

# Boost brightness/contrast/color
r_ch, g_ch, b_ch, a_ch = result.split()
rgb = Image.merge('RGB', (r_ch, g_ch, b_ch))
rgb = ImageEnhance.Brightness(rgb).enhance(4.5)
rgb = ImageEnhance.Contrast(rgb).enhance(2.0)
rgb = ImageEnhance.Color(rgb).enhance(2.0)
r2, g2, b2 = rgb.split()
result = Image.merge('RGBA', (r2, g2, b2, a_ch))

result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("SUCCESS")
