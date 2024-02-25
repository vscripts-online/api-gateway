rm -rf src/pb
npx proto-loader-gen-types --longs=String --enums=String --defaults --keepCase --oneofs --grpcLib=@grpc/grpc-js --outDir=src/pb/ src/proto/*.proto