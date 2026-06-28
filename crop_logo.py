from PIL import Image

img = Image.open('/Users/benjaminedmond/stockguard/src/assets/logo.png')
w, h = img.size
# Crop off the bottom ~18% which contains the label text
cropped = img.crop((0, 0, w, int(h * 0.82)))
cropped.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print(f"Cropped from {h}px to {cropped.size[1]}px")
