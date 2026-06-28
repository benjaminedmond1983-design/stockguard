from PIL import Image
import numpy as np

img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
w, h = img.size

data = np.array(img)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 200) & (g > 200) & (b > 200)
data[white_mask, 3] = 0
clean = Image.fromarray(data)

# Sidebar logo — tight crop to just the shield + STOCKGUARD text
sidebar = clean.crop((int(w*0.22), int(h*0.18), int(w*0.78), int(h*0.72)))
sidebar.save('/Users/benjaminedmond/stockguard/src/assets/logo-sidebar.png')
print(f"Sidebar logo: {sidebar.size}")

# Full logo for login/role screens — remove label text only
full = clean.crop((0, 0, w, int(h*0.78)))
full.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print(f"Full logo: {full.size}")
print("SUCCESS")
