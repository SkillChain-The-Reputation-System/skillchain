import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface BioFieldProps {
  form: any;     
}

export const BioField = ({form} : BioFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="bio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea
              placeholder="I am a software engineer with a passion for blockchain technology."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Describe yourself in a few sentences. This will be visible to other
            users.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
