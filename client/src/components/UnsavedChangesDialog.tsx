import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({ open, onStay, onLeave }: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onClose={onStay} maxWidth="xs" fullWidth>
      <DialogTitle>Unsaved Changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes. Are you sure you want to leave?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onStay} variant="outlined">
          Stay
        </Button>
        <Button onClick={onLeave} variant="contained" color="error">
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
}
