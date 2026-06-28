from PIL import Image, ImageEnhance

img = Image.open('/Users/benjaminedmond/stockguard/src/assets/logo-sidebar.png').convert('RGBA')

# Boost brightness so STOCKGUARD text becomes more visible
enhancer = ImageEnhance.Brightness(img)
img_bright = enhancer.enhance(1.8)

# Boost contrast too
enhancer2 = ImageEnhance.Contrast(img_bright)
img_final = enhancer2.enhance(1.3)

img_final.save('/Users/benjaminedmond/stockguard/src/assets/logo-sidebar.png')
print("SUCCESS")
