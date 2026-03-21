import numpy as np
from PIL import Image
import os

try:
    from sklearn.datasets import load_digits
except ImportError:
    import urllib.request
    urllib.request.urlretrieve('https://raw.githubusercontent.com/scikit-learn/scikit-learn/main/sklearn/datasets/data/digits.csv.gz', 'digits.csv')
    print("Downloaded digits.csv")
    digits = {'images': [], 'target': []}
    with open('digits.csv') as f:
        for line in f:
            if not line.strip(): continue
            parts = [float(x) for x in line.strip().split(',')]
            digits['images'].append(np.array(parts[:-1]).reshape(8,8))
            digits['target'].append(int(parts[-1]))

else:
    digits = load_digits()

os.makedirs('images/mnist', exist_ok=True)

# Find first occurrence of each digit
found = set()
for img, target in zip(digits.images, digits.target):
    if target not in found:
        # Scale 0-16 to 0-255, and invert (white digit on black background)
        # Note: scikit-learn digits are 8x8 which is perfect. We can upscale them to 100x100 for display
        img_normalized = (img / 16.0 * 255.0).astype(np.uint8)
        
        pil_img = Image.fromarray(img_normalized).resize((160, 160), Image.Resampling.NEAREST)
        pil_img.save(f'images/mnist/{target}.png')
        found.add(target)
    if len(found) == 10:
        break

print("Saved digits to images/mnist/")
