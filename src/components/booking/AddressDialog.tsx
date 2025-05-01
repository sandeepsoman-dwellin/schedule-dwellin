
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressInput from "@/components/AddressInput";

interface AddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: string, zipCode: string) => void;
}

const AddressDialog = ({ isOpen, onOpenChange, onAddressSelect }: AddressDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Enter Your Address</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-600 mb-6">
            Please enter your address to continue with booking
          </p>
          <AddressInput 
            onAddressSelect={(address, zipCode) => {
              onAddressSelect(address, zipCode);
              onOpenChange(false);
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;
