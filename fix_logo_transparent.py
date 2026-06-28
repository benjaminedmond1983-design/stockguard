from PIL import Image
import numpy as np

img = Image.open('/Users/benjaminedmond/stockguard/src/assets/logo.png').convert('RGBA')
data = np.array(img)

# Make white/near-white pixels transparent
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 200) & (g > 200) & (b > 200)
data[white_mask, 3] = 0

result = Image.fromarray(data)
result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("SUCCESS - white background removed")
