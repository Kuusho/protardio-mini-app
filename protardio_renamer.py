import os
import glob
from pathlib import Path

def rename_protardios(folder_path):
    """
    Rename all protardio files to sequential numbering from 1 to 2000
    """
    # Convert to Path object for easier handling
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Folder {folder_path} doesn't exist!")
        return
    
    # Get all PNG files in the folder
    all_files = list(folder.glob("*.png"))
    
    print(f"Found {len(all_files)} PNG files in {folder_path}")
    
    # Separate regular and _b2 files
    regular_files = []
    b2_files = []
    
    for file_path in all_files:
        if "_b2" in file_path.stem:
            b2_files.append(file_path)
        else:
            regular_files.append(file_path)
    
    print(f"Regular files: {len(regular_files)}")
    print(f"B2 variant files: {len(b2_files)}")
    
    # Sort both lists by their numeric value
    def extract_number(file_path):
        # Extract number from filename like "123.png" or "123_b2.png"
        stem = file_path.stem
        if "_b2" in stem:
            number_str = stem.replace("_b2", "")
        else:
            number_str = stem
        try:
            return int(number_str)
        except ValueError:
            return 0
    
    regular_files.sort(key=extract_number)
    b2_files.sort(key=extract_number)
    
    # Create a temporary directory to avoid naming conflicts
    temp_dir = folder / "temp_rename"
    temp_dir.mkdir(exist_ok=True)
    
    print("Starting rename process...")
    
    # First, move all files to temp directory with new names
    new_index = 1
    renamed_files = []
    
    # Process regular files first (1-1000)
    for i, file_path in enumerate(regular_files):
        if new_index <= 2000:
            new_name = f"{new_index}.png"
            temp_path = temp_dir / new_name
            
            try:
                file_path.rename(temp_path)
                renamed_files.append((temp_path, folder / new_name))
                print(f"Renamed {file_path.name} → {new_name}")
                new_index += 1
            except Exception as e:
                print(f"Error renaming {file_path.name}: {e}")
    
    # Process B2 files next (continuing from where regular files left off)
    for i, file_path in enumerate(b2_files):
        if new_index <= 2000:
            new_name = f"{new_index}.png"
            temp_path = temp_dir / new_name
            
            try:
                file_path.rename(temp_path)
                renamed_files.append((temp_path, folder / new_name))
                print(f"Renamed {file_path.name} → {new_name}")
                new_index += 1
            except Exception as e:
                print(f"Error renaming {file_path.name}: {e}")
    
    # Now move all files back to the original directory
    print("\nMoving files back to original directory...")
    for temp_path, final_path in renamed_files:
        try:
            temp_path.rename(final_path)
        except Exception as e:
            print(f"Error moving {temp_path.name} to final location: {e}")
    
    # Remove temporary directory
    try:
        temp_dir.rmdir()
        print("Removed temporary directory")
    except Exception as e:
        print(f"Warning: Could not remove temp directory: {e}")
    
    print(f"\n✅ Rename complete! {len(renamed_files)} files renamed sequentially.")
    print(f"Files are now numbered 1-{len(renamed_files)}")
    
    # Verify the result
    final_files = list(folder.glob("*.png"))
    final_files.sort(key=lambda x: int(x.stem))
    print(f"\nVerification: Found {len(final_files)} files after rename")
    if final_files:
        first_file = final_files[0].name
        last_file = final_files[-1].name
        print(f"Range: {first_file} to {last_file}")

if __name__ == "__main__":
    # Update this path to your protardios folder
    protardios_folder = "./protardios/protardios"
    
    print("🎭 Protardio File Renamer")
    print("=" * 50)
    print(f"Target folder: {protardios_folder}")
    print()
    
    # Ask for confirmation
    response = input("This will rename ALL PNG files in the folder. Continue? (y/N): ")
    if response.lower() in ['y', 'yes']:
        rename_protardios(protardios_folder)
    else:
        print("Operation cancelled.")