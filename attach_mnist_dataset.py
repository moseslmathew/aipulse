import os
import random
import base64
from PIL import Image

def build_digit_data():
    base_dir = "images/mnist_png/testing"
    
    digits_js = "const VEHICLES = [\n"
    colors = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#a855f7']
    labels = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

    for d in range(10):
        digit_dir = os.path.join(base_dir, str(d))
        files = [f for f in os.listdir(digit_dir) if f.endswith('.png')]
        random.seed(42 + d)
        selected = random.sample(files, min(20, len(files)))
        
        sample_data = []
        for file in selected:
            fp = os.path.join(digit_dir, file)
            with open(fp, "rb") as imm:
                b64 = base64.b64encode(imm.read()).decode('utf-8')
            
            img = Image.open(fp).convert('L')
            # Downscale real MNIST 28x28 to 5x5 using BILINEAR
            img_5x5 = img.resize((5, 5), Image.Resampling.BILINEAR)
            
            px_val = []
            for y in range(5):
                for x in range(5):
                    # In MNIST pngs: digit is white (255), background is black (0)
                    px_val.append(round(img_5x5.getpixel((x,y)) / 255.0, 2))
                    
            sample_data.append(f"{{ b64: 'data:image/png;base64,{b64}', pixels: {px_val} }}")

        outWeights = [0.01] * 10
        outWeights[d] = 2.95
        
        digits_js += f"""  {{
    id:'{d}', label:'{labels[d]}', emoji:'{emojis[d]}', color:'{colors[d]}',
    outWeights: {outWeights},
    samples: [{', '.join(sample_data)}],
    get imgUrl() {{ return this.samples[this.currentSample].b64; }},
    get pixels() {{ return this.samples[this.currentSample].pixels; }},
    currentSample: 0,
    drawSVG(S,x,y,w,h,dk,cm){{ makeImgDrawSVG(this.imgUrl,this.color)(S,x,y,w,h,dk,cm); }}
  }},\n"""
    
    digits_js += "];"
    
    with open('mnist.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    import re
    html = re.sub(r'const VEHICLES = \[\s*\{[\s\S]*?\];', digits_js, html)
    
    with open('mnist.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Done")

if __name__ == '__main__':
    build_digit_data()
