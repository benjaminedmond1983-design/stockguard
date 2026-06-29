from PIL import Image
import numpy as np
from collections import deque

img = Image.open('/Users/benjaminedmond/Downloads/StockGuard_Master_Logo.png').convert('RGBA')
data = np.array(img, dtype=np.uint8)
h, w = data.shape[:2]

visited = np.zeros((h, w), dtype=bool)
queue = deque()
for y in range(h):
    for x in [0, w-1]:
        if not visited[y, x]:
            queue.append((y, x))
            visited[y, x] = True
for x in range(w):
    for y in [0, h-1]:
        if not visited[y, x]:
            queue.append((y, x))
            visited[y, x] = True

bg = data[0, 0, :3].astype(int)
tolerance = 35

while queue:
    y, x = queue.popleft()
    pixel = data[y, x, :3].astype(int)
    if np.all(np.abs(pixel - bg) < tolerance):
        data[y, x, 3] = 0
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

result = Image.fromarray(data)
alpha = data[:,:,3]
rows = np.any(alpha > 10, axis=1)
cols = np.any(alpha > 10, axis=0)
rmin, rmax = np.where(rows)[0][[0,-1]]
cmin, cmax = np.where(cols)[0][[0,-1]]
pad = 10
result = result.crop((max(0,cmin-pad), max(0,rmin-pad), min(w,cmax+pad), min(h,rmax+pad)))

from PIL import ImageEnhance
r_ch, g_ch, b_ch, a_ch = result.split()
rgb = Image.merge('RGB', (r_ch, g_ch, b_ch))
rgb = ImageEnhance.Brightness(rgb).enhance(1.8)
rgb = ImageEnhance.Contrast(rgb).enhance(1.4)
r2, g2, b2 = rgb.split()
result = Image.merge('RGBA', (r2, g2, b2, a_ch))

result.save('/Users/benjaminedmond/stockguard/src/assets/logo.png')
print("Done:", result.size)
