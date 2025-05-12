import setuptools

setuptools.setup(
    name="my_package",  # Navnet på din pakke (du kan vælge hvad som helst)
    version="1.0.0",
    packages=setuptools.find_packages(where="src"),  # Finder alle pakker i src/
    package_dir={"": "src"},  # Angiver, at src/ er roden for pakkerne
    include_package_data=True,  # Hvis du har ekstra filer at inkludere
    install_requires=[],  # Tilføj afhængigheder her, hvis nødvendigt
    zip_safe=False,  # Sørger for, at pakken kan bruges uden zip
)