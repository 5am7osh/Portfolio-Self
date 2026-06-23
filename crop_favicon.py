from PIL import Image

# Open the image
img = Image.open('src/app/icon.png')

# Convert to RGBA if not already
img = img.convert('RGBA')

# Get the bounding box of the non-transparent regions
# getbbox() looks for non-zero pixels, but we want to crop based on alpha channel
alpha = img.split()[-1]
bbox = alpha.getbbox()

if bbox:
    # Crop the image to the bounding box
    img_cropped = img.crop(bbox)
    
    # Resize it to a square (e.g. 512x512) for a perfect favicon, preserving aspect ratio
    # Let's just let Next.js handle the resizing, but it's best if we make it square
    # We will pad it to a square
    width, height = img_cropped.size
    new_size = max(width, height)
    
    # Create a new transparent square image
    square_img = Image.new('RGBA', (new_size, new_size), (0, 0, 0, 0))
    
    # Paste the cropped image into the center
    paste_x = (new_size - width) // 2
    paste_y = (new_size - height) // 2
    square_img.paste(img_cropped, (paste_x, paste_y))
    
    # Save it back
    square_img.save('src/app/icon.png')
    print("Cropped successfully!")
else:
    print("Image was completely transparent.")
