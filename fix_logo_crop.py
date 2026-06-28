from PIL import Image

img = Image.open('/Users/benjaminedmond/stockguard/src/assets/logo.png').convert('RGBA')
w, h = img.size
print(f"Original size: {w}x{h}")

# Crop to just the shield — remove outer circuit board border
# The shield occupies roughly the center 65% of the image
left = int(w * 0.18)
top = int(h * 0.12)
right = int(w * 0.82)
bottom = int(h * 0.78)

cropped = img.crop((left, top, right, bottom))
cropped.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print(f"Cropped to: {cropped.size[0]}x{cropped.size[1]}")
print("SUCCESS")
