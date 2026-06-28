from PIL import Image, ImageEnhance, ImageFilter

img = Image.open('/Users/benjaminedmond/stockguard/src/assets/logo.png').convert('RGBA')

# Split into RGB and Alpha
r, g, b, a = img.split()
rgb = Image.merge('RGB', (r, g, b))

# Boost brightness and contrast significantly
rgb = ImageEnhance.Brightness(rgb).enhance(2.2)
rgb = ImageEnhance.Contrast(rgb).enhance(1.5)
rgb = ImageEnhance.Sharpness(rgb).enhance(2.0)

# Merge back with original alpha
result = Image.merge('RGBA', (*rgb.split(), a))
result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("SUCCESS")
