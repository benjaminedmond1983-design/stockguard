from PIL import Image, ImageEnhance
import numpy as np

img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0].astype(int), data[:,:,1].astype(int), data[:,:,2].astype(int), data[:,:,3].astype(int)

# Match the actual navy background [14, 32, 47] with tolerance
bg_r, bg_g, bg_b = 14, 32, 47
tolerance = 30
is_bg = (np.abs(r - bg_r) < tolerance) & (np.abs(g - bg_g) < tolerance) & (np.abs(b - bg_b) < tolerance)
data[:,:,3] = np.where(is_bg, 0, data[:,:,3])

result = Image.fromarray(data)

# Crop to content
alpha = data[:,:,3]
rows = np.any(alpha > 10, axis=1)
cols = np.any(alpha > 10, axis=0)
rmin, rmax = np.where(rows)[0][[0,-1]]
cmin, cmax = np.where(cols)[0][[0,-1]]
pad = 15
result = result.crop((max(0,cmin-pad), max(0,rmin-pad), min(result.width,cmax+pad), min(result.height,rmax+pad)))

# Light boost only — logo has its own strong colors
r_ch, g_ch, b_ch, a_ch = result.split()
rgb = Image.merge('RGB', (r_ch, g_ch, b_ch))
rgb = ImageEnhance.Brightness(rgb).enhance(2.0)
rgb = ImageEnhance.Contrast(rgb).enhance(1.5)
r2, g2, b2 = rgb.split()
result = Image.merge('RGBA', (r2, g2, b2, a_ch))

result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("SUCCESS - size:", result.size)
