import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { S3Image } from "aws-amplify-react";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { updateProduct } from "../graphql/mutations";
import { convertCentsToDollars, convertDollarsToCents } from "../utils/index";
import { UserContext } from "../App";
import PayButton from "./PayButton";

class Product extends React.Component {
  state = {
    updateProductDialog: false,
    description: "",
    price: "",
    shipped: false
  };

  handleUpdateProduct = async productId => {
    try {
      this.setState({ updateProductDialog: false });
      const { description, price, shipped } = this.state;
      const input = {
        id: productId,
        description,
        shipped,
        price: convertDollarsToCents(price)
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log({ result });
      Notification({
        title: "success",
        message: "Product successfully updated",
        type: "success",
        duration: 2000
      });
      setTimeout(() => window.location.reload(), 4000);
    } catch (err) {
      console.error(`Failed to update product with id: ${productId}`, err);
    }
  };

  render() {
    const { updateProductDialog, description, price, shipped } = this.state;
    const { product } = this.props;
    return (
      <UserContext.Consumer>
        {({ user }) => {
          const isProductOwner = user && user.attributes.sub === product.owner;
          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: { maxWidth: "100%", maxHeight: "100%" }
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="items-center">
                    <img
                      src={`https://icon.now.sh/${
                        product.shipped ? "markunread_mailbox" : "mail"
                      }`}
                      alt="Shipping Icon"
                      className="icon"
                    />
                    {product.shipped ? "Shipped" : "Emailed"}
                  </div>
                  <div className="text-right">
                    <span className="mx-1">
                      ${convertCentsToDollars(product.price)}
                    </span>
                    {!isProductOwner && <PayButton />}
                  </div>
                </div>
              </Card>
              {/* Update / Delete product buttons */}
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      className="m-1"
                      onClick={() =>
                        this.setState({
                          updateProductDialog: true,
                          description: product.description,
                          shipped: product.shipped,
                          price: convertCentsToDollars(product.price)
                        })
                      }
                    />
                    <Button
                      type="danger"
                      icon="delete"
                      className="m-1"
                      onClick={() =>
                        this.setState({ updateProductDialog: false })
                      }
                    />
                  </>
                )}
              </div>

              {/* Update Product Dialog */}
              <Dialog
                title="Update Product"
                size="large"
                customClass="dialog"
                visible={updateProductDialog}
                onCancel={() => this.setState({ updateProductDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Update Description">
                      <Input
                        type="text"
                        trim={true}
                        icon="information"
                        value={description}
                        placeholder="Product Description"
                        onChange={description => this.setState({ description })}
                      />
                    </Form.Item>
                    <Form.Item label="Update Price">
                      <Input
                        type="number"
                        icon="plus"
                        value={price}
                        placeholder="Price ($USD)"
                        onChange={price => this.setState({ price })}
                      />
                    </Form.Item>
                    <Form.Item label="Update Shipping">
                      <div className="text-center">
                        <Radio
                          value="true"
                          checked={shipped === true}
                          onChange={() => this.setState({ shipped: true })}
                        >
                          Shipped
                        </Radio>
                        <Radio
                          value="false"
                          checked={shipped === false}
                          onChange={() => this.setState({ shipped: false })}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updateProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
