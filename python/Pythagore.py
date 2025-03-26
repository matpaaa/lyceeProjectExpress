import cv2
import numpy as np
import svgwrite
import svgpathtools
from typing import Tuple, List
import sys


class ImageToGcode:
    def __init__(self, feedrate: int = 1500, z_up: float = 5.0, z_down: float = 0.0,
                 canny_threshold1: int = 150, canny_threshold2: int = 150) -> None:
        """
        Initialise les paramètres de conversion.
       
        :param feedrate: Vitesse de déplacement du G-code en mm/min.
        :param z_up: Hauteur du stylo lorsqu'il est levé.
        :param z_down: Hauteur du stylo lorsqu'il dessine.
        :param canny_threshold1: Seuil bas du filtre Canny pour la détection de contours.
        :param canny_threshold2: Seuil haut du filtre Canny.
        """
        self.feedrate: int = feedrate  
        self.z_up: float = z_up        
        self.z_down: float = z_down    
        self.canny_threshold1: int = canny_threshold1  
        self.canny_threshold2: int = canny_threshold2  

    def convert_to_black_and_white(self, image_path: str) -> np.ndarray:
        """
        Convertit une image en noir et blanc avec détection des contours.
       
        :param image_path: Chemin de l'image d'entrée.
        :return: Image binaire avec les contours détectés.
        """
        image: np.ndarray = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        image = cv2.equalizeHist(image)
        edges: np.ndarray = cv2.Canny(image, self.canny_threshold1, self.canny_threshold2)
        return edges

    def contours_to_svg(self, image: np.ndarray, output_svg: str) -> None:
        """
        Convertit les contours détectés en fichier SVG.
       
        :param image: Image binaire contenant les contours.
        :param output_svg: Chemin du fichier SVG de sortie.
        """
        contours, _ = cv2.findContours(image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        dwg: svgwrite.Drawing = svgwrite.Drawing(output_svg, profile='tiny')

        for contour in contours:
            if len(contour) > 5:  # Éviter les petits artefacts
                path_data: str = "M " + " ".join(f"{x},{y}" for [[x, y]] in contour)
                dwg.add(dwg.path(d=path_data, stroke="black", fill="none"))

        dwg.save()
        print(f"Image vectorisée enregistrée sous {output_svg}")

    def svg_to_gcode(self, svg_file: str, output_gcode: str) -> None:
        """
        Convertit un fichier SVG en G-code.
       
        :param svg_file: Chemin du fichier SVG d'entrée.
        :param output_gcode: Chemin du fichier G-code de sortie.
        """
        paths, attributes = svgpathtools.svg2paths(svg_file)

        with open(output_gcode, "w") as gcode:
            gcode.write("G21 ; Mode en mm\n")
            gcode.write("G90 ; Positionnement absolu\n")
            gcode.write(f"G0 Z{self.z_up} ; Lever le stylo\n")

            for path in paths:
                points: np.ndarray = np.array([[segment.start.real, segment.start.imag] for segment in path] +
                                              [[path[-1].end.real, path[-1].end.imag]])

                # Inversion de Y pour correspondre au repère de l'imprimante
                points[:, 1] = -points[:, 1]

                # Déplacer le stylo au premier point sans dessiner
                x0, y0 = points[0]
                gcode.write(f"G0 X{x0:.2f} Y{y0:.2f} F{self.feedrate}\n")
                gcode.write(f"G0 Z{self.z_down} ; Descendre pour dessiner\n")

                # Suivre le chemin
                for x, y in points[1:]:
                    gcode.write(f"G1 X{x:.2f} Y{y:.2f} F{self.feedrate}\n")

                # Lever le stylo après avoir fini le tracé
                gcode.write(f"G0 Z{self.z_up}\n")

            gcode.write("G0 X0 Y0 ; Retour à l'origine\n")
            gcode.write("M30 ; Fin du programme\n")

        print(f"G-code généré : {output_gcode}")

    def process_image(self, image_path: str, output_svg: str, output_gcode: str) -> None:
        """
        Pipeline complet : conversion d'une image en G-code.
       
        :param image_path: Chemin de l'image d'entrée.
        :param output_svg: Chemin du fichier SVG de sortie.
        :param output_gcode: Chemin du fichier G-code de sortie.
        """
        bw_image: np.ndarray = self.convert_to_black_and_white(image_path)
        self.contours_to_svg(bw_image, output_svg)
        self.svg_to_gcode(output_svg, output_gcode)


if __name__ == "__main__":
    kwargs = { v.split(":")[0][2:]: v.split(":")[1] for v in sys.argv if v[:2] == "--" }
    converter = ImageToGcode(feedrate=kwargs.get("feedrate", 1200), z_up=kwargs.get("z_up", 3.0), z_down=kwargs.get("z_down", -0.2), canny_threshold1=kwargs.get("canny_threshold1", 100), canny_threshold2=kwargs.get("canny_threshold", 200))
    # converter = ImageToGcode(feedrate=1200, z_up=3.0, z_down=-0.2, canny_threshold1=100, canny_threshold2=200)
   
    converter.process_image(kwargs.get('file'), "output.svg", "output.gcode")