#!/bin/bash

src='Backend'

echo stop backend
sudo systemctl stop tradersalloy

echo cleanup backend sources
rm -rf ./Backend

echo unpack new backend source to /home/trader/${src}
tar -zxf ./backend.tar.gz

echo install deps
cd ./${src}

npm install

echo create symlink to Penser Analysis documents data
ln -s /home/trader/backend_docs /home/trader/Frontend/dist/companyanalysis

echo create symlink to server data
ln -s /home/trader/backend_data /home/trader/Backend/server/Data

echo create symlink for Froala uploads
ln -s /home/trader/Backend/upload /home/trader/froala_images

echo create symlink for company logos
ln -s /home/trader/Frontend/dist/images/logos/senofidk /home/trader/company_logos

echo run backend
sudo systemctl start tradersalloy

cd ..

echo remove artifact
rm ./backend.tar.gz
